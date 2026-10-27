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
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#d4cdbe]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
            03 AGENT REASONING & REPLAN TOOLBELT
          </span>
          <span className="text-[10px] font-mono text-[#857f72]">6 / 6 Native Stages</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-[#57534e]">
          <span>
            Calls: <strong className="text-[#18181b]">{providerCallsCount}</strong>
          </span>
          <span>
            Replans: <strong className="text-[#b45309]">{replanCount} / 3</strong>
          </span>
          <span>
            Elapsed: <strong className="text-[#18181b]">{elapsedSeconds}s</strong>
          </span>
        </div>
      </div>

      <div className="text-xs font-mono text-[#18181b] mb-3 bg-[#f6f4ee] p-2.5 border border-[#1c1917] flex items-center gap-2">
        <span className="text-[#15803d]">■</span>
        <span>{stageMessage || 'Orchestrating agent workflows...'}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map((s, idx) => {
          const isCurrent = currentStage === s.id;
          const isPassed =
            STAGES.findIndex(item => item.id === currentStage) > idx;

          return (
            <div
              key={s.id}
              className={`p-2 border text-[10px] font-mono transition-all ${
                isCurrent
                  ? 'bg-[#121212] border-[#121212] text-white font-bold'
                  : isPassed
                  ? 'bg-[#f6f4ee] border-[#1c1917] text-[#15803d]'
                  : 'bg-[#ded7c7]/50 border-[#d4cdbe] text-[#857f72]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span>0{idx + 1}</span>
                {isPassed && <span>✓ PASS</span>}
                {isCurrent && <span className="animate-pulse">● ACTIVE</span>}
              </div>
              <div className="leading-tight">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
