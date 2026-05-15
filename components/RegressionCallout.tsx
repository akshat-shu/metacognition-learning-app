'use client';

import { useEffect, useState } from 'react';

type Props = {
  events: Array<{ misc_id: string; belief: string; reason: string }>;
};

export default function RegressionCallout({ events }: Props) {
  const [visible, setVisible] = useState(true);

  // Auto-fade after ~15 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timer);
  }, [events]);

  if (!visible || events.length === 0) return null;

  return (
    <div className="space-y-2">
      {events.map((evt, i) => (
        <div
          key={`${evt.misc_id}-${i}`}
          className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs animate-fade-in"
        >
          <div className="flex items-center gap-1.5 text-red-700 font-medium mb-0.5">
            <span className="text-red-500">&#8595;</span>
            Sam slipped back on this
          </div>
          <p className="text-red-600 italic">"{evt.belief}"</p>
          {evt.reason && <p className="text-red-500 mt-0.5">{evt.reason}</p>}
        </div>
      ))}
    </div>
  );
}
