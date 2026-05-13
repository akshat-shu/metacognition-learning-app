type ScenarioCardProps = {
  personaName: string;
  subject: string;
  scenario: string;
  onEndSession: () => void;
  ending: boolean;
};

export function ScenarioCard({
  personaName,
  subject,
  scenario,
  onEndSession,
  ending,
}: ScenarioCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Scenario
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            You&apos;re talking to {personaName}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Subject: {subject}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">{scenario}</p>
        </div>
        <button
          type="button"
          onClick={onEndSession}
          disabled={ending}
          className="rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 hover:from-slate-800 hover:to-slate-900 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
        >
          {ending ? "Ending..." : "End session"}
        </button>
      </div>
    </div>
  );
}
