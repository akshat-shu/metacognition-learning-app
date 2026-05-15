'use client';

import styles from './CoachCard.module.css';

type Props = {
  nudge: string;
  trigger: 'soft_nudge' | 'stuck' | 'reasoning_weak' | 'hint_request' | 'transfer_check';
  intensity: 'soft' | 'firm' | 'directive';
  onDismiss: () => void;
};

const TRIGGER_LABELS: Record<string, string> = {
  soft_nudge:     'Suggestion',
  stuck:          'Strategy nudge',
  reasoning_weak: 'Teaching tip',
  hint_request:   'Hint',
  transfer_check: 'Transfer check',
};

const CARD_CLASS:  Record<string, string> = {
  soft:      styles.cardSoft,
  firm:      styles.cardFirm,
  directive: styles.cardDirective,
};
const LABEL_CLASS: Record<string, string> = {
  soft:      styles.labelSoft,
  firm:      styles.labelFirm,
  directive: styles.labelDirective,
};
const TEXT_CLASS:  Record<string, string> = {
  soft:      styles.nudgeTextSoft,
  firm:      styles.nudgeTextFirm,
  directive: styles.nudgeTextDirective,
};

export default function CoachCard({ nudge, trigger, intensity, onDismiss }: Props) {
  return (
    <div className={`${styles.card} ${CARD_CLASS[intensity] ?? styles.cardFirm}`}>
      <div className={styles.header}>
        <span className={`${styles.label} ${LABEL_CLASS[intensity] ?? styles.labelFirm}`}>
          {TRIGGER_LABELS[trigger] ?? 'Coach'}
        </span>
        <button onClick={onDismiss} className={styles.dismiss}>&times;</button>
      </div>
      <p className={`${styles.nudgeText} ${TEXT_CLASS[intensity] ?? styles.nudgeTextFirm}`}>
        {nudge}
      </p>
    </div>
  );
}
