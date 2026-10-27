// app/components/ExecutionTrace.tsx
// UI State 2: Real-time streaming agent trace with stage progression, timer, and call counts.

import React from 'react';

const STAGES = [
  { id: 'validating', label: 'Validating Constraints' },
  { id: 'resolving_seeds', label: 'Qloo Seed Resolution' },
  { id: 'scoring_taste', label: 'Qloo Taste Ranking' },
  { id: 'checking_constraints', label: 'Integer-Cent Ledger & Pareto Check' },
  { id: 'replanning', label: 'Constraint Replanning' },
  { id: 'packaging', label: 'Packaging Final Plan' }
];

export function ExecutionTrace({
  currentStage,
  stageMessage,
  elapsedSeconds,
  providerCallsCount,
  replanCount
}: {
  currentStage: string;
  stageMessage?: string;
  elapsedSeconds: number;
  providerCallsCount: number;
  replanCount: number;
}) {
  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-xl shadow-indigo-950/20">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </div>
          <span className="text-sm font-semibold text-white">Agent Execution Trace</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>
            Provider Calls: <strong className="text-indigo-400">{providerCallsCount}</strong>
          </span>
          <span>
            Replans: <strong className="text-amber-400">{replanCount} / 3</strong>
          </span>
          <span>
            Elapsed: <strong className="text-slate-200">{elapsedSeconds}s</strong>
          </span>
        </div>
      </div>

      <p className="text-xs font-mono text-indigo-300 mb-4 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
        {stageMessage || 'Orchestrating agent workflows...'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map((s, idx) => {
          const isCurrent = currentStage === s.id;
          const isPassed =
            STAGES.findIndex(item => item.id === currentStage) > idx;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                isCurrent
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                  : isPassed
                  ? 'bg-slate-950/60 border-emerald-900/40 text-emerald-400'
                  : 'bg-slate-950/30 border-slate-800/50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">0{idx + 1}</span>
                {isPassed && <span>✓</span>}
                {isCurrent && <span className="animate-pulse">●</span>}
              </div>
              <div className="leading-tight font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
