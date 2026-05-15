'use client';

import { useMemo, useState } from 'react';
import styles from './RecapView.module.css';

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

const MOMENT_CLASS: Record<string, string> = {
  breakthrough:   styles.momentBreakthrough,
  caught_probe:   styles.momentCaughtProbe,
  good_question:  styles.momentGoodQuestion,
  missed_probe:   styles.momentMissedProbe,
  over_correction:styles.momentOverCorrection,
  regression:     styles.momentRegression,
};

const DIMENSION_LABELS: Record<string, string> = {
  framing:     'Framing',
  questions:   'Questions',
  reasoning:   'Reasoning',
  uncertainty: 'Uncertainty',
  calibration: 'Calibration',
};
const DIMENSION_HINTS: Record<string, string> = {
  framing:     'How you scoped and focused the inquiry',
  questions:   'How probing and well-targeted your questions were',
  reasoning:   'How visibly you showed structured thought',
  uncertainty: 'How you handled what you didn\'t know',
  calibration: 'How well your confidence matched reality',
};

function gapInsight(predicted: number, actual: number, label: string): string {
  const gap = predicted - actual;
  if (Math.abs(gap) < 0.5) return `Your read on ${label.toLowerCase()} matched the AI's. Nice calibration.`;
  if (gap > 1.5)  return `You over-rated yourself on ${label.toLowerCase()} by ${gap.toFixed(1)} — worth asking why.`;
  if (gap > 0.5)  return `You over-rated yourself on ${label.toLowerCase()} a little (+${gap.toFixed(1)}).`;
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
    <div className={styles.container}>
      <h1 className={styles.heading}>Session Recap</h1>

      {/* Predict-then-reveal */}
      <section>
        <h2 className={styles.sectionHeading}>
          {revealed ? 'Teaching Growth' : 'First — rate yourself'}
        </h2>
        <p className={styles.sectionSub}>
          {revealed
            ? 'Where your self-rating matched the AI\'s read (and where it didn\'t).'
            : 'Before you see the AI\'s scores, predict how you did on each dimension. The gap between your guess and the AI\'s read is where the learning is.'}
        </p>

        <div className={styles.dimList}>
          {dimKeys.map(key => {
            const actual    = dimension_averages[key];
            const predicted = predictions[key];
            return (
              <div key={key} className={styles.dimCard}>
                <div className={styles.dimCardRow}>
                  <span className={styles.dimLabel}>{DIMENSION_LABELS[key] ?? key}</span>
                  {revealed ? (
                    <span className={styles.dimScore}>
                      You: <strong>{predicted}/5</strong>
                      <span style={{ margin: '0 4px' }}>·</span>
                      AI: <strong className={styles.dimScorePrimary}>{actual.toFixed(1)}/5</strong>
                    </span>
                  ) : (
                    <span className={styles.dimScore}>{predicted}/5</span>
                  )}
                </div>
                <p className={styles.dimHint}>{DIMENSION_HINTS[key]}</p>
                {!revealed && (
                  <input
                    type="range"
                    min={1} max={5} step={1}
                    value={predicted}
                    onChange={e => setPredictions(p => ({ ...p, [key]: Number(e.target.value) }))}
                    className={styles.range}
                  />
                )}
                {revealed && (
                  <>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${(actual / 5) * 100}%` }} />
                      <div
                        className={styles.barMarker}
                        style={{ left: `calc(${(predicted / 5) * 100}% - 1.5px)` }}
                        title={`Your prediction: ${predicted}/5`}
                      />
                    </div>
                    <p className={styles.gapText}>{gapInsight(predicted, actual, DIMENSION_LABELS[key] ?? key)}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!revealed && (
          <button onClick={() => setRevealed(true)} className={styles.revealBtn}>
            Reveal the AI&apos;s scores
          </button>
        )}
        {revealed && <p className={styles.takeaway}>{takeaway}</p>}
      </section>

      {revealed && (
        <>
          {/* Key moments */}
          <section>
            <h2 className={styles.sectionHeading}>Key Moments</h2>
            <div className={styles.momentList}>
              {moments.map((m, i) => (
                <div key={i} className={`${styles.moment} ${MOMENT_CLASS[m.type] ?? styles.momentDefault}`}>
                  <div className={styles.momentTypeRow}>
                    <span className={styles.momentType}>{m.type.replace('_', ' ')}</span>
                    <span className={styles.momentTurn}>Turn {m.turnIndex}</span>
                  </div>
                  <p className={styles.momentDesc}>{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reflection */}
          {reflection && (
            <section>
              <h2 className={styles.sectionHeading}>Your Reflection</h2>
              <div className={styles.reflectionBox}>
                <p className={styles.reflectionQuote}>&ldquo;{reflection}&rdquo;</p>
                {reflection_check && (
                  <p className={styles.reflectionCoach}>
                    <span className={styles.reflectionCoachLabel}>Coach&apos;s read:</span>{' '}
                    {reflection_check}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* AI Literacy */}
          <section>
            <h2 className={styles.sectionHeading}>AI Literacy</h2>
            <div className={styles.literacyBox}>
              <p className={styles.literacySummary}>
                Sam slipped <strong>{ai_literacy.probes_fired} probes</strong> and{' '}
                <strong>{ai_literacy.traps_fired} traps</strong>. You caught{' '}
                <strong>{totalCaught} of {totalProbes}</strong>.
              </p>
              {ai_literacy.missed_details.length > 0 ? (
                <>
                  <p className={styles.literacyMissedLabel}>Here&apos;s what you missed:</p>
                  <div className={styles.missedList}>
                    {ai_literacy.missed_details.map((d, i) => (
                      <div key={i} className={styles.missedItem}>
                        <p className={styles.missedClaim}>
                          <span className={styles.missedClaimLabel}>{d.type}:</span>{' '}
                          &ldquo;{d.claim}&rdquo;
                        </p>
                        <p className={styles.missedTruth}>Actually: {d.truth}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.literacySuccess}>You caught everything! Excellent AI literacy.</p>
              )}
            </div>
          </section>

          <button onClick={onHome} className={styles.homeBtn}>Back to home</button>
        </>
      )}
    </div>
  );
}
