// app/components/WeeklyBurnWaterfall.tsx
// Solo Weekly Routine spend waterfall vs BLS $58.17/week under-25 benchmark (LI-12, LI-13).

import React from 'react';

export function WeeklyBurnWaterfall({ routine }: { routine: any }) {
  if (!routine?.stops?.length) return null;

  const weeklyCapDollars = (routine.ledger.weeklySlackVsCapCents + routine.ledger.totalWeeklyAllInCents) / 100;
  const totalWeeklyDollars = routine.ledger.totalWeeklyAllInCents / 100;
  const savingsDollars = routine.ledger.LI13_WeeklySavingsVsBlsBenchmarkCents / 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Solo Weekly Routine & Spend Waterfall</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            3 distinct third-place subtypes chosen within your weekly social cap.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Total Spend:</span>{' '}
            <strong className="text-emerald-400">${totalWeeklyDollars.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-indigo-900/40">
            <span className="text-slate-400">BLS Savings:</span>{' '}
            <strong className="text-indigo-400">${savingsDollars.toFixed(2)}/wk</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {routine.stops.map((s: any, idx: number) => {
          const stopLedger = routine.ledger.stopLedgers[idx]?.row;
          const stopSpend = (stopLedger?.LI09_TotalPerPersonAllInCents ?? 0) / 100;
          const runningSpend = (stopLedger?.LI12_WeeklyRunningTotalCents ?? 0) / 100;

          return (
            <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-indigo-400 mb-1">
                  <span>Slot 0{idx + 1}: {s.slot.day.toUpperCase()} {s.slot.start}-{s.slot.end}</span>
                  <span className="capitalize text-slate-400">{s.venue.subtype.replace('_', ' ')}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{s.venue.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{s.venue.address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-500 block">Stop All-In:</span>
                  <span className="text-emerald-400 font-bold">${stopSpend.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Running Total (LI-12):</span>
                  <span className="text-slate-200">${runningSpend.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-slate-400">
          U.S. Bureau of Labor Statistics (BLS) Under-25 Food Away From Home Benchmark: <strong>$58.17/week</strong>
        </span>
        <span className="text-indigo-400 font-bold">
          LI-13 Weekly Discretionary Savings: ${savingsDollars.toFixed(2)} / week
        </span>
      </div>
    </div>
  );
}
