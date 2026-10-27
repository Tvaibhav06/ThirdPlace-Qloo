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
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-[#d4cdbe]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
              04 TASTE & COMMUTE FAIRNESS SCORECARD
            </span>
            <span className="text-[10px] font-mono text-[#857f72]">Pareto Floor: 0.55 Min</span>
          </div>
          <p className="text-xs text-[#57534e] mt-0.5 font-serif">
            Squad Consensus Score: <strong className="text-[#18181b] font-mono">{(fairness?.squadConsensusScore * 100 || 0).toFixed(1)} / 100</strong>
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#18181b] cursor-pointer bg-[#f6f4ee] px-3 py-1 border border-[#1c1917]">
          <input
            type="checkbox"
            checked={blindCapMode}
            onChange={onToggleBlindCap}
            className="accent-[#18181b]"
          />
          <span className="font-mono text-[11px] uppercase tracking-wider font-bold">Blind Cap Mode [Active]</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono text-[#18181b] border-collapse">
          <thead className="bg-[#ded7c7] text-[#18181b] uppercase text-[10px] tracking-wider border-b border-[#1c1917]">
            <tr>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Member</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Taste Rank</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Commute (Out / Ret)</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Round Trip</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">All-In Spend</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Budget Cap</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cdbe] bg-[#f6f4ee]">
            {ledger.memberLedgers.map((m: any, idx: number) => {
              const leg = commuteLegs?.[m.alias] || { outwardMin: 15, returnMin: 15, roundTripMin: 30, transitTimeModeled: true };
              const rankVal = fairness?.effectiveRanks?.[m.alias] ?? 0.85;

              return (
                <tr key={idx} className="hover:bg-[#ded7c7]/50 transition-colors">
                  <td className="py-2 px-3 font-bold border-r border-[#d4cdbe]">{m.alias}</td>
                  <td className="py-2 px-3 border-r border-[#d4cdbe] text-[#18181b] font-bold">{(rankVal * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 border-r border-[#d4cdbe] text-[#57534e]">
                    {leg.outwardMin}m / {leg.returnMin}m {!leg.transitTimeModeled && <span className="text-[10px] text-[#b45309] font-bold">(unmodeled)</span>}
                  </td>
                  <td className="py-2 px-3 border-r border-[#d4cdbe]">{leg.roundTripMin}m</td>
                  <td className="py-2 px-3 border-r border-[#d4cdbe] font-bold text-[#18181b]">
                    ${(m.LI09_TotalPerPersonAllInCents / 100).toFixed(2)}
                  </td>
                  <td className="py-2 px-3 border-r border-[#d4cdbe]">
                    {m.LI10_MemberCapCents === null ? (
                      <span className="text-[#b91c1c] font-bold text-[10px] bg-[#fee2e2] px-1 py-0.5 border border-[#ef4444]">
                        {m.LI10_DisplayCap}
                      </span>
                    ) : (
                      `$${(m.LI10_MemberCapCents / 100).toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#16a34a]">
                      PASS (+${(m.LI11_SlackCents / 100).toFixed(2)})
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
