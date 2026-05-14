'use client';

type Props = {
  nudge: string;
  type: 'stuck' | 'hint_request' | 'transfer_check';
  onDismiss: () => void;
};

const TYPE_LABELS: Record<string, string> = {
  stuck: 'Strategy nudge',
  hint_request: 'Hint',
  transfer_check: 'Transfer check',
};

export default function CoachCard({ nudge, type, onDismiss }: Props) {
  return (
    <div className="animate-slide-in bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          {TYPE_LABELS[type] || 'Coach'}
        </span>
        <button
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <p className="text-sm text-amber-900">{nudge}</p>
    </div>
  );
}
