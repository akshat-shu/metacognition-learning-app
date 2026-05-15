'use client';

import { useState } from 'react';
import styles from './PreteachFlow.module.css';

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
      <div className={styles.container}>
        <h2 className={styles.heading}>Before you teach</h2>
        <div className={styles.card}>
          <p className={styles.prose}>{conceptPrimer}</p>
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
