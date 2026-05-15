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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scenario
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">
            You&apos;re talking to {personaName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Subject: {subject}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{scenario}</p>
        </div>
        <button
          type="button"
          onClick={onEndSession}
          disabled={ending}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {ending ? "Ending..." : "End session"}
        </button>
      </div>
    </div>
  );
}
