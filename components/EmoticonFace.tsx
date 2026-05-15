'use client';

import { useEffect, useState } from 'react';

type Emoticon = 'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad';

const EMOTICON_MAP: Record<Emoticon, { emoji: string; color: string; label: string }> = {
  delighted: { emoji: '😄', color: 'text-green-500', label: 'Delighted' },
  happy: { emoji: '🙂', color: 'text-green-400', label: 'Happy' },
  neutral: { emoji: '😐', color: 'text-yellow-500', label: 'Neutral' },
  concerned: { emoji: '😟', color: 'text-orange-500', label: 'Concerned' },
  sad: { emoji: '😞', color: 'text-red-500', label: 'Sad' },
};

type Props = {
  emoticon: Emoticon;
  tag: string;
};

export default function EmoticonFace({ emoticon, tag }: Props) {
  const [animate, setAnimate] = useState(false);
  const { emoji, color, label } = EMOTICON_MAP[emoticon] || EMOTICON_MAP.neutral;

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 600);
    return () => clearTimeout(timer);
  }, [emoticon]);

  return (
    <div className="text-center">
      <div className={`text-6xl ${animate ? 'animate-pulse-soft' : ''}`}>
        {emoji}
      </div>
      <p className={`text-sm font-medium mt-1 ${color}`}>{label}</p>
      <p className="text-xs text-gray-500 mt-1 min-h-[1.25rem]">{tag || '—'}</p>
    </div>
  );
}
