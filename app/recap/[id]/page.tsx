'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RecapView from '@/components/RecapView';

export default function RecapPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [synthesis, setSynthesis] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`recap_${sessionId}`);
    if (stored) {
      setSynthesis(JSON.parse(stored));
    }
  }, [sessionId]);

  if (!synthesis) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No recap data found.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <RecapView synthesis={synthesis} onHome={() => router.push('/')} />
    </main>
  );
}
