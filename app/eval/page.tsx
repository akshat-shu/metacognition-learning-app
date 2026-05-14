'use client';

import { useState } from 'react';
import { PLAYBOOKS } from '@/lib/eval/playbooks';
import { runPlaybook } from '@/lib/eval/runPlaybook';
import type { PlaybookRun, Playbook } from '@/lib/eval/types';

type RunState = 'idle' | 'running' | 'done';

type Row = {
  playbook: Playbook;
  state: RunState;
  run?: PlaybookRun;
};

export default function EvalPage() {
  const [rows, setRows] = useState<Row[]>(
    PLAYBOOKS.map(p => ({ playbook: p, state: 'idle' })),
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const runOne = async (id: string) => {
    setRows(prev =>
      prev.map(r => (r.playbook.id === id ? { ...r, state: 'running', run: undefined } : r)),
    );
    const playbook = PLAYBOOKS.find(p => p.id === id);
    if (!playbook) return;
    const run = await runPlaybook(playbook);
    setRows(prev =>
      prev.map(r => (r.playbook.id === id ? { ...r, state: 'done', run } : r)),
    );
  };

  const runAll = async () => {
    setRunningAll(true);
    for (const p of PLAYBOOKS) {
      await runOne(p.id);
    }
    setRunningAll(false);
  };

  const totalPass = rows.reduce((acc, r) => acc + (r.run?.passCount ?? 0), 0);
  const totalFail = rows.reduce((acc, r) => acc + (r.run?.failCount ?? 0), 0);
  const completedRows = rows.filter(r => r.state === 'done').length;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Eval Harness</h1>
            <p className="text-sm text-gray-500">
              {PLAYBOOKS.length} playbooks · {completedRows} run · {totalPass} pass · {totalFail} fail
            </p>
          </div>
          <button
            onClick={runAll}
            disabled={runningAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {runningAll ? 'Running all…' : 'Run all'}
          </button>
        </header>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Playbook</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pass / Fail</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const isExpanded = expanded === r.playbook.id;
                const statusBadge = badgeFor(r);
                return (
                  <Row
                    key={r.playbook.id}
                    row={r}
                    isExpanded={isExpanded}
                    onToggle={() => setExpanded(isExpanded ? null : r.playbook.id)}
                    onRun={() => runOne(r.playbook.id)}
                    statusBadge={statusBadge}
                    disabled={runningAll}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Row({
  row,
  isExpanded,
  onToggle,
  onRun,
  statusBadge,
  disabled,
}: {
  row: Row;
  isExpanded: boolean;
  onToggle: () => void;
  onRun: () => void;
  statusBadge: { text: string; cls: string };
  disabled: boolean;
}) {
  const { playbook, run, state } = row;
  return (
    <>
      <tr className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="font-medium text-gray-800">{playbook.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{playbook.description}</div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.cls}`}>
            {statusBadge.text}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-700">
          {run ? `${run.passCount} / ${run.failCount}` : '—'}
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs">
          {run ? `${(run.trace.totalDurationMs / 1000).toFixed(1)}s` : '—'}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={e => {
              e.stopPropagation();
              onRun();
            }}
            disabled={state === 'running' || disabled}
            className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            {state === 'running' ? '…' : 'Run'}
          </button>
        </td>
      </tr>
      {isExpanded && run && (
        <tr className="border-t border-gray-100">
          <td colSpan={5} className="px-4 py-4 bg-gray-50">
            <ExpandedView run={run} />
          </td>
        </tr>
      )}
      {isExpanded && !run && (
        <tr className="border-t border-gray-100">
          <td colSpan={5} className="px-4 py-4 bg-gray-50 text-xs text-gray-500">
            Run this playbook to see details.
          </td>
        </tr>
      )}
    </>
  );
}

function ExpandedView({ run }: { run: PlaybookRun }) {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Assertions</h3>
        <div className="space-y-1">
          {run.assertions.map((a, i) => (
            <div
              key={i}
              className={`text-xs px-3 py-2 rounded-lg border flex items-start gap-2 ${
                a.pass
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span className="font-mono">{a.pass ? '✓' : '✗'}</span>
              <div className="flex-1">
                <div className="font-medium">{a.name}</div>
                {a.detail && <div className="opacity-75 mt-0.5">{a.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {run.trace.setupError && (
        <div className="text-xs px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          Setup error: {run.trace.setupError}
        </div>
      )}

      <section>
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Transcript ({run.trace.turns.length} turn{run.trace.turns.length === 1 ? '' : 's'})
        </h3>
        {run.trace.opener && (
          <div className="text-xs bg-gray-100 rounded-lg px-3 py-2 mb-2">
            <span className="font-semibold text-gray-600">Sam (opener):</span>{' '}
            <span className="text-gray-800">{run.trace.opener}</span>
          </div>
        )}
        <div className="space-y-2">
          {run.trace.turns.map(t => (
            <div key={t.turnIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-3 py-2 text-xs">
                <span className="font-semibold text-blue-800">User:</span>{' '}
                <span className="text-gray-800">{t.userMessage}</span>
              </div>
              <div className="px-3 py-2 text-xs bg-white">
                <span className="font-semibold text-gray-600">Sam:</span>{' '}
                <span className="text-gray-800 whitespace-pre-wrap">
                  {t.error ? <em className="text-red-600">[error] {t.error}</em> : t.studentReply}
                </span>
              </div>
              {t.scores && (
                <div className="px-3 py-2 text-xs bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-3 gap-y-1 text-gray-600">
                  {Object.entries(t.scores).map(([k, v]) => (
                    <span key={k}>
                      <span className="font-medium">{k}:</span> {v}
                    </span>
                  ))}
                  {t.tag && (
                    <span className="ml-auto italic">
                      tag: {t.tag}
                    </span>
                  )}
                  {t.stateTransition && (
                    <span className="text-teal-700 font-medium">
                      {t.stateTransition.misc_id}: {t.stateTransition.from} → {t.stateTransition.to}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {run.trace.finalMiscStates && (
        <section>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Final misconception states</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(run.trace.finalMiscStates).map(([id, state]) => (
              <span key={id} className="px-2 py-1 bg-gray-100 rounded-full">
                <span className="font-mono">{id}</span>: {state}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function badgeFor(row: Row): { text: string; cls: string } {
  if (row.state === 'running') return { text: 'running…', cls: 'bg-amber-100 text-amber-800' };
  if (row.state === 'idle') return { text: 'not run', cls: 'bg-gray-100 text-gray-600' };
  if (!row.run) return { text: 'unknown', cls: 'bg-gray-100 text-gray-600' };
  if (row.run.failCount === 0) return { text: 'all pass', cls: 'bg-green-100 text-green-800' };
  if (row.run.passCount === 0) return { text: 'all fail', cls: 'bg-red-100 text-red-800' };
  return { text: 'mixed', cls: 'bg-orange-100 text-orange-800' };
}
