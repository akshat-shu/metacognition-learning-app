'use client';

import { useEffect, useState } from 'react';
import styles from './EmoticonFace.module.css';

type Emoticon = 'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad';

const EMOTICON_MAP: Record<Emoticon, { emoji: string; labelClass: string; label: string }> = {
  delighted: { emoji: '😄', labelClass: styles.labelDelighted, label: 'Delighted' },
  happy:     { emoji: '🙂', labelClass: styles.labelHappy,     label: 'Happy'     },
  neutral:   { emoji: '😐', labelClass: styles.labelNeutral,   label: 'Neutral'   },
  concerned: { emoji: '😟', labelClass: styles.labelConcerned, label: 'Concerned' },
  sad:       { emoji: '😞', labelClass: styles.labelSad,       label: 'Sad'       },
};

type Props = {
  emoticon: Emoticon;
  tag: string;
};

export default function EmoticonFace({ emoticon, tag }: Props) {
  const [animate, setAnimate] = useState(false);
  const { emoji, labelClass, label } = EMOTICON_MAP[emoticon] ?? EMOTICON_MAP.neutral;

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(timer);
  }, [emoticon]);

  return (
    <div className={styles.container}>
      <span className={`${styles.emoji} ${animate ? 'animate-pulse-soft' : ''}`}>{emoji}</span>
      <p className={`${styles.label} ${labelClass}`}>{label}</p>
      <p className={styles.description}>{tag || '—'}</p>
    </div>
  );
}
