'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SamStatePanel.module.css';

type MisconceptionState = 'entrenched' | 'aware' | 'considering' | 'updating' | 'settled';

const ITEM_CLASS: Record<MisconceptionState, string> = {
  entrenched:  styles.itemEntrenched,
  aware:       styles.itemAware,
  considering: styles.itemConsidering,
  updating:    styles.itemUpdating,
  settled:     styles.itemSettled,
};
const DOT_CLASS: Record<MisconceptionState, string> = {
  entrenched:  styles.dotEntrenched,
  aware:       styles.dotAware,
  considering: styles.dotConsidering,
  updating:    styles.dotUpdating,
  settled:     styles.dotSettled,
};
const DOT_CHAR: Record<MisconceptionState, string> = {
  entrenched:  '●',
  aware:       '◐',
  considering: '◑',
  updating:    '○',
  settled:     '●',
};

type Props = {
  miscStates: Record<string, MisconceptionState>;
  misconceptions: Array<{ id: string; belief: string }>;
};

export default function SamStatePanel({ miscStates, misconceptions }: Props) {
  // Track which ids are currently animating a state transition
  const [flashingIds, setFlashingIds]           = useState<Set<string>>(new Set());
  // Track which ids just transitioned to settled (to play strikethrough animation)
  const [newlySettledIds, setNewlySettledIds]   = useState<Set<string>>(new Set());
  // Track which ids just had their state label change
  const [newStateLabelIds, setNewStateLabelIds] = useState<Set<string>>(new Set());

  const prevStatesRef = useRef<Record<string, MisconceptionState>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    // Skip animation on first render — just record baseline
    if (!initializedRef.current) {
      const initial: Record<string, MisconceptionState> = {};
      for (const m of misconceptions) {
        initial[m.id] = (miscStates[m.id] as MisconceptionState) ?? 'entrenched';
      }
      prevStatesRef.current = initial;
      initializedRef.current = true;
      return;
    }

    const changed = new Set<string>();
    const justSettled = new Set<string>();

    for (const m of misconceptions) {
      const prev = prevStatesRef.current[m.id];
      const curr = (miscStates[m.id] as MisconceptionState) ?? 'entrenched';
      if (prev !== curr) {
        changed.add(m.id);
        if (curr === 'settled') justSettled.add(m.id);
      }
    }

    if (changed.size > 0) {
      setFlashingIds(changed);
      setNewStateLabelIds(changed);
      if (justSettled.size > 0) setNewlySettledIds(justSettled);

      // Clear flash after animation
      const t1 = setTimeout(() => setFlashingIds(new Set()), 800);
      const t2 = setTimeout(() => setNewStateLabelIds(new Set()), 500);
      // Keep newly-settled for the duration of the strikethrough animation (0.15s delay + 0.55s)
      const t3 = setTimeout(() => setNewlySettledIds(new Set()), 900);

      // Update ref
      const next: Record<string, MisconceptionState> = { ...prevStatesRef.current };
      for (const m of misconceptions) {
        next[m.id] = (miscStates[m.id] as MisconceptionState) ?? 'entrenched';
      }
      prevStatesRef.current = next;

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [miscStates, misconceptions]);

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Sam&apos;s beliefs</h3>
      <div className={styles.list}>
        {misconceptions.map(m => {
          const state   = (miscStates[m.id] as MisconceptionState) ?? 'entrenched';
          const isFlash   = flashingIds.has(m.id);
          const isSettled = state === 'settled';
          const isJustSettled = newlySettledIds.has(m.id);
          const isNewLabel    = newStateLabelIds.has(m.id);

          return (
            <div
              key={m.id}
              className={[
                styles.item,
                ITEM_CLASS[state],
                isFlash ? styles.itemTransitioning : '',
              ].join(' ')}
            >
              <span className={`${styles.dot} ${DOT_CLASS[state]}`}>{DOT_CHAR[state]}</span>
              <div className={styles.info}>
                <p className={`${styles.state} ${isNewLabel ? styles.stateNew : ''}`}>{state}</p>
                <p
                  className={[
                    styles.belief,
                    isSettled    ? styles.beliefSettled    : '',
                    isJustSettled ? styles.beliefJustSettled : '',
                  ].join(' ')}
                >
                  {m.belief}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
