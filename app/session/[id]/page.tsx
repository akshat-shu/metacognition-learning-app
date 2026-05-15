'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import EmoticonFace from '@/components/EmoticonFace';
import SamStatePanel from '@/components/SamStatePanel';
import CoachCard from '@/components/CoachCard';
import RegressionCallout from '@/components/RegressionCallout';

type SessionData = {
  sessionId: string;
  opener: string;
  session: {
    brief: {
      persona: { name: string; age: number; vibe: string };
      subject: string;
      scenario: string;
      misconceptions: Array<{ id: string; belief: string }>;
    };
    turns: Array<{ role: 'user' | 'student'; content: string }>;
    miscStates: Record<string, string>;
  };
};

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [emoticon, setEmoticon] = useState<'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad'>('neutral');
  const [tag, setTag] = useState('');
  const [miscStates, setMiscStates] = useState<Record<string, string>>({});
  const [coachNudge, setCoachNudge] = useState<{ nudge: string; trigger?: string; intensity?: string } | null>(null);
  const [stateTransitions, setStateTransitions] = useState<Array<{ from: string; to: string; misc_id: string }>>([]);
  const [regressionEvents, setRegressionEvents] = useState<Array<{ misc_id: string; belief: string; reason: string }>>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submittingEnd, setSubmittingEnd] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`session_${sessionId}`);
    if (stored) {
      const data = JSON.parse(stored) as SessionData;
      setSessionData(data);
      setMiscStates(data.session.miscStates);
    }
  }, [sessionId]);

  const handleMeta = (meta: any) => {
    if (meta.emoticon) setEmoticon(meta.emoticon);
    if (meta.tag) setTag(meta.tag);
    if (meta.miscStates && Object.keys(meta.miscStates).length > 0) {
      setMiscStates(meta.miscStates);
    }
    if (meta.coachNudge) {
      setCoachNudge(meta.coachNudge);
    }
    // Handle multiple state transitions
    if (meta.state_transitions && meta.state_transitions.length > 0) {
      setStateTransitions(meta.state_transitions);
      const names = meta.state_transitions.map((t: any) => `${t.misc_id}: ${t.from} → ${t.to}`).join(', ');
      setTag(`Sam shifted: ${names}`);
      setTimeout(() => setStateTransitions([]), 5000);
    }
    // Handle regression events
    if (meta.regressionEvents && meta.regressionEvents.length > 0) {
      setRegressionEvents(meta.regressionEvents);
    } else {
      setRegressionEvents([]);
    }
  };

  const handleEnd = () => {
    setShowReflection(true);
  };

  const submitReflectionAndEnd = async () => {
    if (reflection.trim().length < 10 || submittingEnd) return;
    setSubmittingEnd(true);
    try {
      const res = await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reflection: reflection.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem(`recap_${sessionId}`, JSON.stringify({ ...data.synthesis, reflection: reflection.trim() }));
        router.push(`/recap/${sessionId}`);
      }
    } catch (error) {
      console.error('End session error:', error);
      setSubmittingEnd(false);
    }
  };

  if (!sessionData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading session...</p>
        </div>
      </main>
    );
  }

  const { brief } = sessionData.session;
  const initialMessages = sessionData.session.turns.map(t => ({
    role: t.role,
    content: t.content,
  }));

  return (
    <main className="h-screen flex">
      {/* Chat — 60% */}
      <div className="w-full lg:w-3/5 flex flex-col border-r border-gray-200">
        <Chat
          sessionId={sessionId}
          initialMessages={initialMessages}
          personaName={brief.persona.name}
          subject={brief.subject}
          onMeta={handleMeta}
          onEnd={handleEnd}
        />
      </div>

      {/* Side panel — 40% */}
      <div className="hidden lg:flex lg:w-2/5 flex-col p-6 space-y-6 overflow-y-auto bg-gray-50">
        <EmoticonFace emoticon={emoticon} tag={tag} />

        {stateTransitions.length > 0 && (
          <div className="animate-fade-in bg-teal-50 border border-teal-200 rounded-xl p-3 text-center space-y-1">
            {stateTransitions.map((t, i) => (
              <p key={i} className="text-teal-800 text-sm font-medium">
                {t.misc_id}: {t.from} &rarr; {t.to}
              </p>
            ))}
          </div>
        )}

        <RegressionCallout events={regressionEvents} />

        <SamStatePanel
          miscStates={miscStates as any}
          misconceptions={brief.misconceptions}
        />

        {coachNudge && (
          <CoachCard
            nudge={coachNudge.nudge}
            trigger={(coachNudge.trigger || 'stuck') as 'soft_nudge' | 'stuck' | 'reasoning_weak' | 'hint_request' | 'transfer_check'}
            intensity={(coachNudge.intensity || 'firm') as 'soft' | 'firm' | 'directive'}
            onDismiss={() => setCoachNudge(null)}
          />
        )}
      </div>

      {showReflection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Before you go &mdash; one reflection</h2>
            <p className="text-sm text-gray-600 mb-4">
              Name one move you tried that didn&apos;t land &mdash; and what you&apos;d try instead next time.
            </p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="I tried &hellip; but it didn&apos;t work because &hellip;  Next time I&apos;d &hellip;"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                {reflection.trim().length < 10 ? 'At least one sentence' : 'Looks good'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReflection(false)}
                  disabled={submittingEnd}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Keep teaching
                </button>
                <button
                  onClick={submitReflectionAndEnd}
                  disabled={reflection.trim().length < 10 || submittingEnd}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submittingEnd ? 'Saving…' : 'Submit & see recap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
