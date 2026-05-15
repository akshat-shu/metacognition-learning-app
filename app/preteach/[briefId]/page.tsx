'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PreteachFlow from '@/components/PreteachFlow';
import styles from './preteach.module.css';

export default function PreteachPage() {
  const params  = useParams();
  const router  = useRouter();
  const briefId = params.briefId as string;

  const [preteachData, setPreteachData] = useState<{
    concept_primer: string;
    misconception_preview: string;
    strategy_options: string[];
  } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);

  const [error, setError] = useState('');
  const initiated = useRef(false);


  const fetchedRef = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    async function init() {
      try {
        const res = await fetch('/api/preteach/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ briefId }),
        });
        if (!res.ok) throw new Error('Failed to load preteach content');
        const data = await res.json();
        setPreteachData(data);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [briefId]);

  const handleComplete = async (strategies: string[]) => {
    setStarting(true);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId, strategyChoices: strategies }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      const data = await res.json();
      sessionStorage.setItem(`session_${data.sessionId}`, JSON.stringify(data));
      router.push(`/session/${data.sessionId}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to start session');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Preparing your session…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCenter}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!preteachData) return null;

  return (
    <main className={styles.page}>
      <PreteachFlow
        conceptPrimer={preteachData.concept_primer}
        misconceptionPreview={preteachData.misconception_preview}
        strategyOptions={preteachData.strategy_options}
        onComplete={handleComplete}
        loading={starting}
      />
    </main>
  );
}
