'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import Link from 'next/link';

const EXAMPLES = [
  'How vaccines train the immune system',
  'Why the sky is blue (Rayleigh scattering)',
  'How compound interest works',
  'Why objects float or sink (buoyancy)',
=======
import styles from './home.module.css';

type BuiltInBrief = {
  id: string;
  subject: string;
  scenario: string;
  miscCount: number;
  personaName: string;
  personaAge: number;
};

const BUILT_INS: BuiltInBrief[] = [
  {
    id: 'physics-freefall-1',
    subject: 'Physics — gravity and free fall',
    scenario: "Sam doesn't believe heavy objects fall at the same rate as light ones.",
    miscCount: 3,
    personaName: 'Sam',
    personaAge: 15,
  },
>>>>>>> 47b3181 (removed secret)
];

export default function Home() {
  const router = useRouter();
<<<<<<< HEAD
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
=======
  const [topic, setTopic]           = useState('');
  const [sources, setSources]       = useState('');
  const [strict, setStrict]         = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState('');
>>>>>>> 47b3181 (removed secret)

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
<<<<<<< HEAD
=======
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to generate brief.');
      }
>>>>>>> 47b3181 (removed secret)
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      router.push(`/preteach/${data.briefId}`);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Reverse Tutor</h1>
        <p className={styles.subheading}>Teach an AI student. Learn to calibrate trust.</p>

        {/* Custom session creator */}
        <section className={styles.card}>
          <h2 className={styles.cardHeading}>Create your own session</h2>
          <p className={styles.cardSub}>
            Pick anything you want to study. Sam will arrive with realistic misconceptions about it.
          </p>

          <label className={styles.fieldLabel}>What do you want to study?</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. photosynthesis, the French Revolution, recursion in code"
            disabled={generating}
            className={styles.input}
          />

          <button
            type="button"
            onClick={() => setShowSources(s => !s)}
            disabled={generating}
            className={styles.toggleBtn}
          >
            {showSources ? '− Hide sources' : '+ Add your own sources (optional)'}
          </button>

          {showSources && (
            <>
              <textarea
                value={sources}
                onChange={e => setSources(e.target.value)}
                placeholder="Paste notes, an article, a textbook excerpt…"
                rows={5}
                disabled={generating}
                className={`${styles.input} ${styles.textarea}`}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={strict}
                  onChange={e => setStrict(e.target.checked)}
                  disabled={generating || sources.trim().length === 0}
                />
                Strictly use only this source (no outside knowledge)
              </label>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            onClick={generate}
            disabled={topic.trim().length < 3 || generating}
            className={styles.primaryBtn}
>>>>>>> 47b3181 (removed secret)
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

<<<<<<< HEAD
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
=======
        {/* Built-in briefs */}
        <p className={styles.sectionLabel}>Or try a pre-built session</p>
        <div className={styles.briefList}>
          {BUILT_INS.map(brief => (
            <Link key={brief.id} href={`/preteach/${brief.id}`} className={styles.briefCard}>
              <h2 className={styles.briefSubject}>{brief.subject}</h2>
              <p className={styles.briefScenario}>{brief.scenario}</p>
              <div className={styles.briefTags}>
                <span className={`${styles.tagBase} ${styles.tagMisc}`}>
                  {brief.miscCount} misconceptions
                </span>
                <span className={`${styles.tagBase} ${styles.tagPersona}`}>
                  {brief.personaName}, {brief.personaAge}
                </span>
              </div>
            </Link>
          ))}
>>>>>>> 47b3181 (removed secret)
        </div>
      </div>
    </main>
  );
}
