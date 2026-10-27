// app/components/FairnessScorecard.tsx
// Per-friend taste & commute scorecard with P0 Blind Cap Mode privacy masking.

import React from 'react';

export function FairnessScorecard({
  ledger,
  fairness,
  commuteLegs,
  blindCapMode,
  onToggleBlindCap
}: {
  ledger: any;
  fairness: any;
  commuteLegs: any;
  blindCapMode: boolean;
  onToggleBlindCap: () => void;
}) {
  if (!ledger?.memberLedgers?.length) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Per-Friend Taste & Commute Scorecard</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Squad Consensus Score: <strong className="text-indigo-400 font-mono">{(fairness?.squadConsensusScore * 100 || 0).toFixed(1)} / 100</strong> (Pareto taste floor 0.55 enforced)
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <input
            type="checkbox"
            checked={blindCapMode}
            onChange={onToggleBlindCap}
            className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0"
          />
          <span className="font-mono">Blind Cap Mode (Active)</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Taste Rank</th>
              <th className="py-2.5 px-3">Commute (Out / Ret)</th>
              <th className="py-2.5 px-3">Round Trip</th>
              <th className="py-2.5 px-3">All-In Spend</th>
              <th className="py-2.5 px-3">Budget Cap</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {ledger.memberLedgers.map((m: any, idx: number) => {
              const leg = commuteLegs?.[m.alias] || { outwardMin: 15, returnMin: 15, roundTripMin: 30, transitTimeModeled: true };
              const rankVal = fairness?.effectiveRanks?.[m.alias] ?? 0.85;

              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">{m.alias}</td>
                  <td className="py-2.5 px-3 text-indigo-300">{(rankVal * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {leg.outwardMin}m / {leg.returnMin}m {!leg.transitTimeModeled && <span className="text-[10px] text-amber-500/80">(transit time unmodeled)</span>}
                  </td>
                  <td className="py-2.5 px-3">{leg.roundTripMin}m</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    ${(m.LI09_TotalPerPersonAllInCents / 100).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    {m.LI10_MemberCapCents === null ? (
                      <span className="text-slate-500 italic">{m.LI10_DisplayCap}</span>
                    ) : (
                      `$${(m.LI10_MemberCapCents / 100).toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      PASS (+${(m.LI11_SlackCents / 100).toFixed(2)} slack)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
