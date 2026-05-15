'use client';

import { useEffect, useState } from 'react';
import styles from './RegressionCallout.module.css';

type Props = {
  events: Array<{ misc_id: string; belief: string; reason: string }>;
};

export default function RegressionCallout({ events }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timer);
  }, [events]);

  if (!visible || events.length === 0) return null;

  return (
    <div className={styles.list}>
      {events.map((evt, i) => (
        <div key={`${evt.misc_id}-${i}`} className={styles.event}>
          <div className={styles.header}>
            <span className={styles.icon}>&#8595;</span>
            Sam slipped back on this
          </div>
          <p className={styles.belief}>&ldquo;{evt.belief}&rdquo;</p>
          {evt.reason && <p className={styles.reason}>{evt.reason}</p>}
        </div>
      ))}
    </div>
  );
}
