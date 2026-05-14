'use client';

type MisconceptionState = 'entrenched' | 'aware' | 'considering' | 'updating' | 'settled';

const STATE_CONFIG: Record<MisconceptionState, { dot: string; color: string; bg: string }> = {
  entrenched: { dot: '●', color: 'text-gray-400', bg: 'bg-gray-100' },
  aware: { dot: '◐', color: 'text-purple-400', bg: 'bg-purple-50' },
  considering: { dot: '◑', color: 'text-purple-500', bg: 'bg-purple-50' },
  updating: { dot: '○', color: 'text-teal-500', bg: 'bg-teal-50' },
  settled: { dot: '●', color: 'text-teal-600', bg: 'bg-teal-50' },
};

type Props = {
  miscStates: Record<string, MisconceptionState>;
  misconceptions: Array<{ id: string; belief: string }>;
};

export default function SamStatePanel({ miscStates, misconceptions }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Sam&apos;s beliefs</h3>
      <div className="space-y-2">
        {misconceptions.map(m => {
          const state = miscStates[m.id] || 'entrenched';
          const config = STATE_CONFIG[state];
          return (
            <div key={m.id} className={`flex items-start gap-2 p-2 rounded-lg ${config.bg} transition-colors duration-300`}>
              <span className={`${config.color} text-lg leading-none mt-0.5`}>{config.dot}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 capitalize">{state}</p>
                <p className="text-sm text-gray-700 truncate">{m.belief}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
