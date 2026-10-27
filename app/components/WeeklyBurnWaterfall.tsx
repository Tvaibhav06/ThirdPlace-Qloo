// app/components/WeeklyBurnWaterfall.tsx
// Solo Weekly Routine spend waterfall vs BLS $58.17/week under-25 benchmark (LI-12, LI-13).

import React from 'react';

export function WeeklyBurnWaterfall({ routine }: { routine: any }) {
  if (!routine?.stops?.length) return null;

  const weeklyCapDollars = (routine.ledger.weeklySlackVsCapCents + routine.ledger.totalWeeklyAllInCents) / 100;
  const totalWeeklyDollars = routine.ledger.totalWeeklyAllInCents / 100;
  const savingsDollars = routine.ledger.LI13_WeeklySavingsVsBlsBenchmarkCents / 100;

  return (
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d4cdbe]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
              03 SOLO WEEKLY ROUTINE & SPEND WATERFALL
            </span>
            <span className="text-[10px] font-mono text-[#857f72]">3 Slots: Tue / Thu / Sat</span>
          </div>
          <p className="text-xs text-[#57534e] mt-0.5 font-serif">
            Distinct third-place subtypes chosen within your weekly social cap.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-[#f6f4ee] px-3 py-1 border border-[#1c1917]">
            <span className="text-[#57534e]">Spend:</span>{' '}
            <strong className="text-[#18181b]">${totalWeeklyDollars.toFixed(2)}</strong>
          </div>
          <div className="bg-[#dcfce7] px-3 py-1 border border-[#16a34a]">
            <span className="text-[#15803d]">BLS Savings:</span>{' '}
            <strong className="text-[#15803d]">${savingsDollars.toFixed(2)}/wk</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {routine.stops.map((s: any, idx: number) => {
          const stopLedger = routine.ledger.stopLedgers[idx]?.row;
          const stopSpend = (stopLedger?.LI09_TotalPerPersonAllInCents ?? 0) / 100;
          const runningSpend = (stopLedger?.LI12_WeeklyRunningTotalCents ?? 0) / 100;

          return (
            <div key={idx} className="bg-[#f6f4ee] border border-[#1c1917] p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#57534e] mb-1">
                  <span>SLOT 0{idx + 1}: {s.slot.day.toUpperCase()} {s.slot.start}-{s.slot.end}</span>
                  <span className="capitalize">{s.venue.subtype.replace('_', ' ')}</span>
                </div>
                <h4 className="text-sm font-serif font-bold text-[#18181b] mt-1">{s.venue.name}</h4>
                <p className="text-xs text-[#57534e] mt-0.5 font-mono">{s.venue.address}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#d4cdbe] font-mono text-xs flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-[#857f72] block">Stop All-In:</span>
                  <span className="text-[#18181b] font-bold">${stopSpend.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#857f72] block">Running Total (LI-12):</span>
                  <span className="text-[#18181b] font-bold">${runningSpend.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#f6f4ee] p-3 border border-[#1c1917] text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-[#57534e]">
          U.S. Bureau of Labor Statistics (BLS) Under-25 Benchmark: <strong>$58.17/week</strong>
        </span>
        <span className="text-[#15803d] font-bold">
          LI-13 Weekly Discretionary Savings: ${savingsDollars.toFixed(2)} / week
        </span>
      </div>
    </div>
  );
}
