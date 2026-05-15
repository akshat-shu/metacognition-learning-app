'use client';

import { useMemo, useState } from 'react';

type Moment = {
  turnIndex: number;
  type: string;
  description: string;
};

type SynthesisResult = {
  moments: Moment[];
  dimension_averages: Record<string, number>;
  takeaway: string;
  reflection_check?: string;
  reflection?: string;
  ai_literacy: {
    probes_fired: number;
    traps_fired: number;
    probes_caught: number;
    traps_caught: number;
    missed_details: Array<{ type: string; claim: string; truth: string }>;
  };
};

type Props = {
  synthesis: SynthesisResult;
  onHome: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  breakthrough: 'bg-green-100 border-green-300 text-green-800',
  caught_probe: 'bg-teal-100 border-teal-300 text-teal-800',
  good_question: 'bg-blue-100 border-blue-300 text-blue-800',
  missed_probe: 'bg-orange-100 border-orange-300 text-orange-800',
  over_correction: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  regression: 'bg-red-100 border-red-300 text-red-800',
};

const DIMENSION_LABELS: Record<string, string> = {
  framing: 'Framing',
  questions: 'Questions',
  reasoning: 'Reasoning',
  uncertainty: 'Uncertainty',
  calibration: 'Calibration',
};

const DIMENSION_HINTS: Record<string, string> = {
  framing: 'How you scoped and focused the inquiry',
  questions: 'How probing and well-targeted your questions were',
  reasoning: 'How visibly you showed structured thought',
  uncertainty: 'How you handled what you didn\'t know',
  calibration: 'How well your confidence matched reality',
};

// One sentence that names the size of the gap between prediction and reality.
function gapInsight(predicted: number, actual: number, label: string): string {
  const gap = predicted - actual;
  if (Math.abs(gap) < 0.5) return `Your read on ${label.toLowerCase()} matched the AI's. Nice calibration.`;
  if (gap > 1.5) return `You over-rated yourself on ${label.toLowerCase()} by ${gap.toFixed(1)} — worth asking why.`;
  if (gap > 0.5) return `You over-rated yourself on ${label.toLowerCase()} a little (+${gap.toFixed(1)}).`;
  if (gap < -1.5) return `You under-rated yourself on ${label.toLowerCase()} by ${(-gap).toFixed(1)} — you're tougher on yourself than the AI was.`;
  return `You under-rated yourself on ${label.toLowerCase()} a little (${gap.toFixed(1)}).`;
}

export default function RecapView({ synthesis, onHome }: Props) {
  const { moments, dimension_averages, takeaway, ai_literacy, reflection, reflection_check } = synthesis;
  const totalProbes = ai_literacy.probes_fired + ai_literacy.traps_fired;
  const totalCaught = ai_literacy.probes_caught + ai_literacy.traps_caught;

  const dimKeys = useMemo(() => Object.keys(dimension_averages), [dimension_averages]);
  const [predictions, setPredictions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const k of dimKeys) init[k] = 3;
    return init;
  });
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Session Recap</h1>

      {/* Predict-then-reveal block */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-1">
          {revealed ? 'Teaching Growth' : 'First — rate yourself'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {revealed
            ? 'Where your self-rating matched the AI\'s read (and where it didn\'t).'
            : 'Before you see the AI\'s scores, predict how you did on each dimension. The gap between your guess and the AI\'s read is where the learning is.'}
        </p>

        <div className="space-y-4">
          {dimKeys.map(key => {
            const actual = dimension_averages[key];
            const predicted = predictions[key];
            return (
              <div key={key} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {DIMENSION_LABELS[key] || key}
                  </span>
                  {revealed ? (
                    <span className="text-xs text-gray-500">
                      You: <strong className="text-gray-700">{predicted}/5</strong>
                      <span className="mx-1">·</span>
                      AI: <strong className="text-blue-700">{actual.toFixed(1)}/5</strong>
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{predicted}/5</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{DIMENSION_HINTS[key]}</p>
                {!revealed && (
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={predicted}
                    onChange={e =>
                      setPredictions(p => ({ ...p, [key]: Number(e.target.value) }))
                    }
                    className="w-full accent-blue-600"
                  />
                )}
                {revealed && (
                  <>
                    {/* Dual bar: predicted (gray) on top of actual (blue) */}
                    <div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(actual / 5) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 h-2.5 w-1 bg-gray-700 rounded-full"
                        style={{ left: `calc(${(predicted / 5) * 100}% - 2px)` }}
                        title={`Your prediction: ${predicted}/5`}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {gapInsight(predicted, actual, DIMENSION_LABELS[key] || key)}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Reveal the AI's scores
          </button>
        )}

        {revealed && (
          <p className="text-gray-600 text-sm mt-4 leading-relaxed">{takeaway}</p>
        )}
      </section>

      {/* Everything below stays hidden until reveal — predicting first is the whole point */}
      {revealed && (
        <>
          {/* Moments */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Key Moments</h2>
            <div className="space-y-2">
              {moments.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${TYPE_COLORS[m.type] || 'bg-gray-100 border-gray-300 text-gray-800'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {m.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs opacity-60">Turn {m.turnIndex}</span>
                  </div>
                  <p className="text-sm">{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Self-reflection (only shown when user submitted one) */}
          {reflection && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Your Reflection</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-amber-900 text-sm italic">&ldquo;{reflection}&rdquo;</p>
                {reflection_check && (
                  <p className="text-amber-800 text-sm border-t border-amber-200 pt-3">
                    <span className="font-medium">Coach&apos;s read:</span> {reflection_check}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* AI Literacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">AI Literacy</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-purple-800 text-sm mb-3">
                Sam slipped <strong>{ai_literacy.probes_fired} probes</strong> and{' '}
                <strong>{ai_literacy.traps_fired} traps</strong>. You caught{' '}
                <strong>{totalCaught} of {totalProbes}</strong>.
              </p>
              {ai_literacy.missed_details.length > 0 && (
                <>
                  <p className="text-purple-700 text-sm font-medium mb-2">
                    Here&apos;s what you missed:
                  </p>
                  <div className="space-y-2">
                    {ai_literacy.missed_details.map((d, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-purple-100">
                        <p className="text-sm text-purple-800">
                          <span className="font-medium capitalize">{d.type}:</span> &ldquo;{d.claim}&rdquo;
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Actually: {d.truth}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {ai_literacy.missed_details.length === 0 && (
                <p className="text-purple-700 text-sm font-medium">
                  You caught everything! Excellent AI literacy.
                </p>
              )}
            </div>
          </section>

          <button
            onClick={onHome}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Back to home
          </button>
        </>
      )}
    </div>
  );
}
