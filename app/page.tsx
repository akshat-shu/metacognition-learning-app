'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EXAMPLES = [
  'How vaccines train the immune system',
  'Why the sky is blue (Rayleigh scattering)',
  'How compound interest works',
  'Why objects float or sink (buoyancy)',
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      router.push(`/preteach/${data.briefId}`);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Reverse Tutor</h1>
        <p className="text-gray-500 mb-8">
          Pick a topic. Teach Sam. Discover what you actually understand.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to teach?
            </label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="e.g. How gravity affects falling objects regardless of mass"
              rows={3}
              maxLength={200}
              disabled={mounted && loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{mounted ? topic.length : 0}/200</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!mounted || !topic.trim() || loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Building session...
              </>
            ) : (
              'Generate Session'
            )}
          </button>

          <div>
            <p className="text-xs text-gray-400 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setTopic(ex)}
                  disabled={mounted && loading}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/preteach/physics-freefall-1"
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Or jump straight to the built-in physics session
          </Link>
        </div>
      </div>
    </main>
  );
}
