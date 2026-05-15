'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import EmoticonFace from '@/components/EmoticonFace';
import SamStatePanel from '@/components/SamStatePanel';
import CoachCard from '@/components/CoachCard';
import RegressionCallout from '@/components/RegressionCallout';
import styles from './session.module.css';

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

const SIDE_MIN = 220; // px
const SIDE_MAX = 600; // px
const SIDE_DEFAULT_PCT = 38; // % of viewport

export default function SessionPage() {
  const params    = useParams();
  const router    = useRouter();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [emoticon, setEmoticon] = useState<'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad'>('neutral');
  const [tag, setTag]           = useState('');
  const [miscStates, setMiscStates]   = useState<Record<string, string>>({});
  const [coachNudge, setCoachNudge]   = useState<{ nudge: string; trigger?: string; intensity?: string } | null>(null);
  const [stateTransitions, setStateTransitions] = useState<Array<{ from: string; to: string; misc_id: string }>>([]);
  const [regressionEvents, setRegressionEvents] = useState<Array<{ misc_id: string; belief: string; reason: string }>>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection]         = useState('');
  const [submittingEnd, setSubmittingEnd]   = useState(false);

  // ── Resizable sidebar ──────────────────────────
  const [sideWidthPx, setSideWidthPx] = useState<number | null>(null); // null = use CSS default
  const [isDragging, setIsDragging]   = useState(false);
  const dragStartX   = useRef(0);
  const dragStartW   = useRef(0);
  const pageRef      = useRef<HTMLElement>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Resolve current pixel width if we're still using the percentage default
    const panel = pageRef.current?.querySelector('[data-side-panel]') as HTMLElement | null;
    const currentW = panel ? panel.offsetWidth : Math.round(window.innerWidth * SIDE_DEFAULT_PCT / 100);
    dragStartX.current = e.clientX;
    dragStartW.current = currentW;
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      // Dragging handle leftward → side grows; rightward → side shrinks
      const delta = dragStartX.current - e.clientX;
      const next  = Math.min(SIDE_MAX, Math.max(SIDE_MIN, dragStartW.current + delta));
      setSideWidthPx(next);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',  onUp);
    };
  }, [isDragging]);

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
    if (meta.miscStates && Object.keys(meta.miscStates).length > 0) setMiscStates(meta.miscStates);
    if (meta.coachNudge) setCoachNudge(meta.coachNudge);
    if (meta.state_transitions && meta.state_transitions.length > 0) {
      setStateTransitions(meta.state_transitions);
      const names = meta.state_transitions.map((t: any) => `${t.misc_id}: ${t.from} → ${t.to}`).join(', ');
      setTag(`Sam shifted: ${names}`);
      setTimeout(() => setStateTransitions([]), 5000);
    }
    setRegressionEvents(meta.regressionEvents?.length > 0 ? meta.regressionEvents : []);
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
      <main className={styles.loadingPage}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading session…</p>
        </div>
      </main>
    );
  }

  const { brief } = sessionData.session;
  const initialMessages = sessionData.session.turns.map(t => ({ role: t.role, content: t.content }));

  // Side panel width: use measured px if dragged, else let CSS percentage handle it
  const sidePanelStyle = sideWidthPx !== null
    ? { width: sideWidthPx + 'px' }
    : { width: `${SIDE_DEFAULT_PCT}%` };

  return (
    <main ref={pageRef} className={styles.page}>
      {/* Chat pane — fills remaining space */}
      <div className={styles.chatPane}>
        <Chat
          sessionId={sessionId}
          initialMessages={initialMessages}
          personaName={brief.persona.name}
          subject={brief.subject}
          onMeta={handleMeta}
          onEnd={() => setShowReflection(true)}
        />
      </div>

      {/* Drag handle */}
      <div
        className={`${styles.resizeHandle} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={onDragStart}
        title="Drag to resize"
      />

      {/* Side panel */}
      <div
        data-side-panel
        className={styles.sidePanel}
        style={sidePanelStyle}
      >
        <EmoticonFace emoticon={emoticon} tag={tag} />

        {stateTransitions.length > 0 && (
          <div className={styles.stateTransition}>
            {stateTransitions.map((t, i) => (
              <p key={i} className={styles.stateTransitionText}>
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
            trigger={(coachNudge.trigger ?? 'stuck') as any}
            intensity={(coachNudge.intensity ?? 'firm') as any}
            onDismiss={() => setCoachNudge(null)}
          />
        )}
      </div>

      {/* Reflection modal */}
      {showReflection && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalHeading}>Before you go &mdash; one reflection</h2>
            <p className={styles.modalSub}>
              Name one move you tried that didn&apos;t land &mdash; and what you&apos;d try instead next time.
            </p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="I tried … but it didn't work because …  Next time I'd …"
              rows={4}
              className={styles.modalTextarea}
              autoFocus
            />
            <div className={styles.modalFooter}>
              <span className={styles.modalHint}>
                {reflection.trim().length < 10 ? 'At least one sentence' : 'Looks good'}
              </span>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowReflection(false)}
                  disabled={submittingEnd}
                  className={styles.cancelBtn}
                >
                  Keep teaching
                </button>
                <button
                  onClick={submitReflectionAndEnd}
                  disabled={reflection.trim().length < 10 || submittingEnd}
                  className={styles.submitBtn}
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
