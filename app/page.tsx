'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type BuiltInBrief = {
  id: string;
  subject: string;
  scenario: string;
  miscCount: number;
  personaName: string;
  personaAge: number;
};

// Hardcoded mirror of getBuiltInBriefs() so the home page can stay a client component
// (we need useRouter + useState for the custom-brief form). Server briefs are still the source
// of truth via /api/preteach/init using the same ids.
const BUILT_INS: BuiltInBrief[] = [
  {
    id: 'physics-freefall-1',
    subject: 'Physics — gravity and free fall',
    scenario: "Sam doesn't believe heavy objects fall at the same rate as light ones.",
    miscCount: 3,
    personaName: 'Sam',
    personaAge: 15,
  },
];

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [sources, setSources] = useState('');
  const [strict, setStrict] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (topic.trim().length < 3 || generating) return;
    setError('');
    setGenerating(true);
    try {
      const res = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          sources: showSources ? sources : '',
          strictSources: showSources && strict && sources.trim().length > 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate brief.');
      }
      const data = await res.json();
      router.push(`/preteach/${data.briefId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate.');
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Reverse Tutor</h1>
        <p className="text-gray-500 mb-8">
          Teach an AI student. Learn to calibrate trust.
        </p>

        {/* Custom session creator */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Create your own session</h2>
          <p className="text-sm text-gray-500 mb-4">
            Pick anything you want to study. Sam will arrive with realistic misconceptions about it.
          </p>

          <label className="block text-xs font-medium text-gray-600 mb-1">What do you want to study?</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. photosynthesis, the French Revolution, recursion in code"
            disabled={generating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          <button
            type="button"
            onClick={() => setShowSources(s => !s)}
            disabled={generating}
            className="text-xs text-blue-600 hover:underline mb-2"
          >
            {showSources ? '− Hide sources' : '+ Add your own sources (optional)'}
          </button>

          {showSources && (
            <>
              <textarea
                value={sources}
                onChange={e => setSources(e.target.value)}
                placeholder="Paste notes, an article, a textbook excerpt..."
                rows={5}
                disabled={generating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 font-mono"
              />
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 select-none">
                <input
                  type="checkbox"
                  checked={strict}
                  onChange={e => setStrict(e.target.checked)}
                  disabled={generating || sources.trim().length === 0}
                  className="rounded"
                />
                Strictly use only this source (no outside knowledge)
              </label>
            </>
          )}

          {error && <p className="text-xs text-red-500 mt-1 mb-2">{error}</p>}

          <button
            onClick={generate}
            disabled={topic.trim().length < 3 || generating}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {generating ? 'Building Sam\'s brain…' : 'Generate session'}
          </button>
        </section>

        {/* Built-in briefs */}
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Or try a pre-built session</p>
        <div className="space-y-3">
          {BUILT_INS.map(brief => (
            <Link
              key={brief.id}
              href={`/preteach/${brief.id}`}
              className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <h2 className="text-base font-semibold text-gray-800">{brief.subject}</h2>
              <p className="text-sm text-gray-500 mt-1">{brief.scenario}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {brief.miscCount} misconceptions
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {brief.personaName}, {brief.personaAge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
