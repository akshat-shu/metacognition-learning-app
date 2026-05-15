'use client';

import { useState } from 'react';
<<<<<<< HEAD
import React from 'react';

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function StructuredText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-gray-800 mt-6 mb-2 first:mt-0">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-gray-700 ml-1 mb-2">
          {bullets.map((b, j) => <li key={j}>{renderInline(b)}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed mb-3">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}
=======
import styles from './PreteachFlow.module.css';
>>>>>>> 47b3181 (removed secret)

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
  const [screen, setScreen]     = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStrategy = (s: string) => {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 2 ? [...prev, s] : prev
    );
  };

  if (screen === 0) {
    return (
<<<<<<< HEAD
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Before you teach</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
          <StructuredText text={conceptPrimer} />
=======
      <div className={styles.container}>
        <h2 className={styles.heading}>Before you teach</h2>
        <div className={styles.card}>
          <p className={styles.prose}>{conceptPrimer}</p>
>>>>>>> 47b3181 (removed secret)
        </div>
        <button onClick={() => setScreen(1)} className={styles.continueBtn}>
          I get it, continue
        </button>
      </div>
    );
  }

  if (screen === 1) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>What you&apos;re walking into</h2>
        <div className={styles.card}>
          <p className={styles.prose}>{misconceptionPreview}</p>
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              Sam will mostly reason correctly. Sometimes they&apos;ll have misconceptions.
              Sometimes they&apos;ll be confidently wrong about side details.{' '}
              <strong>Don&apos;t over-correct. Don&apos;t under-challenge.</strong>{' '}
              Your job is to figure out <em>which claims to trust</em>.
            </p>
          </div>
        </div>
        <button onClick={() => setScreen(2)} className={styles.continueBtn}>
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Pick your approach</h2>
      <p className={styles.subheading}>Choose 1–2 teaching strategies</p>
      <div className={styles.grid}>
        {strategyOptions.map(s => (
          <button
            key={s}
            onClick={() => toggleStrategy(s)}
            className={`${styles.strategyBtn} ${selected.includes(s) ? styles.strategyBtnSelected : ''}`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={() => onComplete(selected)}
        disabled={selected.length === 0 || loading}
        className={styles.continueBtn}
      >
        {loading ? 'Starting session…' : 'Start session'}
      </button>
    </div>
  );
}
