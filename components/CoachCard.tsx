'use client';

type Props = {
  nudge: string;
  trigger: 'soft_nudge' | 'stuck' | 'reasoning_weak' | 'hint_request' | 'transfer_check';
  intensity: 'soft' | 'firm' | 'directive';
  onDismiss: () => void;
};

const TRIGGER_LABELS: Record<string, string> = {
  soft_nudge: 'Suggestion',
  stuck: 'Strategy nudge',
  reasoning_weak: 'Teaching tip',
  hint_request: 'Hint',
  transfer_check: 'Transfer check',
};

const INTENSITY_STYLES: Record<string, { container: string; label: string; text: string }> = {
  soft: {
    container: 'bg-blue-50/60 border-blue-100 shadow-none',
    label: 'text-blue-500',
    text: 'text-blue-700 text-xs',
  },
  firm: {
    container: 'bg-amber-50 border-amber-200 shadow-sm',
    label: 'text-amber-700',
    text: 'text-amber-900 text-sm',
  },
  directive: {
    container: 'bg-amber-50 border-amber-300 shadow-md',
    label: 'text-amber-800 font-bold',
    text: 'text-amber-900 text-sm font-medium',
  },
};

export default function CoachCard({ nudge, trigger, intensity, onDismiss }: Props) {
  const styles = INTENSITY_STYLES[intensity] || INTENSITY_STYLES.firm;

  return (
    <div className={`animate-slide-in border rounded-xl p-4 ${styles.container}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${styles.label}`}>
          {TRIGGER_LABELS[trigger] || 'Coach'}
        </span>
        <button
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <p className={styles.text}>{nudge}</p>
    </div>
  );
}
