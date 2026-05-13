"use client";

import Link from "next/link";
import { useMemo } from "react";

import { readStoredRecap } from "@/lib/session";
import type { SessionRecap } from "@/lib/types";

const borderByType: Record<
  "breakthrough" | "missed_opportunity" | "pivot" | "stumble",
  string
> = {
  breakthrough: "border-emerald-300",
  missed_opportunity: "border-amber-300",
  pivot: "border-sky-300",
  stumble: "border-slate-300",
};

type RecapViewProps = {
  sessionId: string;
};

export function RecapView({ sessionId }: RecapViewProps) {
  const recap = useMemo<SessionRecap | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return readStoredRecap(sessionId);
  }, [sessionId]);

  const bars = useMemo(() => {
    if (!recap) {
      return [];
    }
    return Object.entries(recap.summary.averages) as Array<
      [keyof SessionRecap["summary"]["averages"], number]
    >;
  }, [recap]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Session recap</h1>
        <p className="mt-1 text-sm text-slate-500">Session ID: {sessionId}</p>
      </div>

      {!recap ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No recap found in local storage for this session.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Moments</h2>
            <div className="mt-4 space-y-3">
              {recap.moments.map((moment, index) => (
                <article
                  key={`${moment.turn_index}-${index}`}
                  className={`rounded-xl border p-4 ${borderByType[moment.type]}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {moment.type.replace("_", " ")} · Turn {moment.turn_index}
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{moment.summary}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Why it mattered:</span>{" "}
                    {moment.why_it_mattered}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Try next time:</span>{" "}
                    {moment.try_next_time}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">How you taught</h2>
            <div className="mt-4 space-y-3">
              {bars.map(([label, value]) => {
                const normalized = Math.max(0, Math.min(5, value));
                const width = `${(normalized / 5) * 100}%`;
                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                      <span className="capitalize">{label}</span>
                      <span>{value.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded bg-slate-100">
                      <div
                        className="h-2 rounded bg-indigo-500 transition-all"
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-slate-700">
              <span className="font-medium">Trend:</span> {recap.summary.trend}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {recap.summary.takeaway}
            </p>
          </section>
        </>
      )}

      <Link
        href="/"
        className="inline-flex w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Start new session
      </Link>
    </div>
  );
}
