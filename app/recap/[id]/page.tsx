'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RecapView from '@/components/RecapView';
import styles from './recap.module.css';

export default function RecapPage() {
  const params    = useParams();
  const router    = useRouter();
  const sessionId = params.id as string;

  const [synthesis, setSynthesis] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`recap_${sessionId}`);
    if (stored) setSynthesis(JSON.parse(stored));
  }, [sessionId]);

  if (!synthesis) {
    return (
      <main className={styles.noDataPage}>
        <div className={styles.noDataCenter}>
          <p className={styles.noDataText}>No recap data found.</p>
          <button onClick={() => router.push('/')} className={styles.goHomeBtn}>
            Go home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <RecapView synthesis={synthesis} onHome={() => router.push('/')} />
    </main>
  );
}
