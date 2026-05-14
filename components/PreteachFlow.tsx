'use client';

import { useState } from 'react';

type Props = {
  conceptPrimer: string;
  misconceptionPreview: string;
  strategyOptions: string[];
  onComplete: (strategies: string[]) => void;
  loading?: boolean;
};

export default function PreteachFlow({
  conceptPrimer,
  misconceptionPreview,
  strategyOptions,
  onComplete,
  loading,
}: Props) {
  const [screen, setScreen] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStrategy = (s: string) => {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 2 ? [...prev, s] : prev
    );
  };

  if (screen === 0) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Before you teach</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{conceptPrimer}</p>
        </div>
        <button
          onClick={() => setScreen(1)}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          I get it, continue
        </button>
      </div>
    );
  }

  if (screen === 1) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What you&apos;re walking into</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
          <p className="text-gray-700 leading-relaxed mb-4">{misconceptionPreview}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              Sam will mostly reason correctly. Sometimes they&apos;ll have misconceptions.
              Sometimes they&apos;ll be confidently wrong about side details.{' '}
              <strong>Don&apos;t over-correct. Don&apos;t under-challenge.</strong>{' '}
              Your job is to figure out <em>which claims to trust</em>.
            </p>
          </div>
        </div>
        <button
          onClick={() => setScreen(2)}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Pick your approach</h2>
      <p className="text-gray-500 text-sm mb-4">Choose 1-2 teaching strategies</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {strategyOptions.map(s => (
          <button
            key={s}
            onClick={() => toggleStrategy(s)}
            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
              selected.includes(s)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={() => onComplete(selected)}
        disabled={selected.length === 0 || loading}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting session...' : 'Start session'}
      </button>
    </div>
  );
}
