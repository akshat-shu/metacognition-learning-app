'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PreteachFlow from '@/components/PreteachFlow';

export default function PreteachPage() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.briefId as string;

  const [preteachData, setPreteachData] = useState<{
    concept_primer: string;
    misconception_preview: string;
    strategy_options: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
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
        setError(e.message || 'Failed to load');
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
      // Store session data in sessionStorage for the session page
      sessionStorage.setItem(`session_${data.sessionId}`, JSON.stringify(data));
      router.push(`/session/${data.sessionId}`);
    } catch (e: any) {
      setError(e.message || 'Failed to start session');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Preparing your session...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!preteachData) return null;

  return (
    <main className="min-h-screen flex items-center justify-center">
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
