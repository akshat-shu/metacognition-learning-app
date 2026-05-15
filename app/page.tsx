'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
];

export default function Home() {
  const router = useRouter();
  const [topic, setTopic]           = useState('');
  const [sources, setSources]       = useState('');
  const [strict, setStrict]         = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState('');

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
        throw new Error(data.error ?? 'Failed to generate brief.');
      }
      const data = await res.json();
      router.push(`/preteach/${data.briefId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate.');
      setGenerating(false);
    }
  };

  return (
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
          >
            {generating ? 'Building Sam\'s brain…' : 'Generate session'}
          </button>
        </section>

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
        </div>
      </div>
    </main>
  );
}
