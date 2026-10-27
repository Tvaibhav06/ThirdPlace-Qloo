// app/components/SplitLedgerTable.tsx
// 13-row integer-cent pre-spend split ledger table (LI-01 to LI-13).

import React from 'react';

export function SplitLedgerTable({ ledger, isSolo }: { ledger: any; isSolo: boolean }) {
  if (!ledger?.memberLedgers?.length) return null;

  const rows = [
    { id: 'LI-01', name: 'LI-01: Venue Base Spend', key: 'LI01_BaseVenueSpendCents' },
    { id: 'LI-02', name: 'Secondary Stop Spend', key: 'LI02_SecondaryStopSpendCents' },
    { id: 'LI-03', name: 'Live Event Ticket', key: 'LI03_LiveEventTicketCents' },
    { id: 'LI-04', name: 'Chicago Sales Tax (10.25%)', key: 'LI04_TaxCents' },
    { id: 'LI-05', name: 'Gratuity', key: 'LI05_GratuityCents' },
    { id: 'LI-06', name: 'Shared Items Remainder Cent Split', key: 'LI06_SharedGroupItemsCents' },
    { id: 'LI-07', name: 'Round-Trip Commute Fare', key: 'LI07_MemberCommuteCostCents' },
    { id: 'LI-08', name: 'Contingency Buffer (10%)', key: 'LI08_ContingencyCents' },
    { id: 'LI-09', name: 'LI-09: Total Member Cost', key: 'LI09_TotalPerPersonAllInCents', isTotal: true },
    { id: 'LI-10', name: 'Member Budget Cap', key: 'LI10_MemberCapCents', isCap: true },
    { id: 'LI-11', name: 'Remaining Slack under Binding Floor', key: 'LI11_SlackCents' },
    { id: 'LI-12', name: 'LI-12: Weekly Running Total', key: 'LI12_WeeklyRunningTotalCents', isTotal: isSolo },
    { id: 'LI-13', name: 'LI-13: BLS Weekly Savings', key: 'LI13_WeeklySavingsVsBlsBenchmarkCents', isTotal: isSolo }
  ];

  const visibleRows = isSolo ? rows : rows.slice(0, 11);

  return (
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 my-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d4cdbe]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
              05 13-Row Itemized Pre-Spend Split Ledger
            </span>
            <span className="text-[10px] font-mono text-[#857f72]">Zero Floating-Point Math</span>
          </div>
          <p className="text-xs text-[#57534e] mt-0.5 font-serif">
            Integer-cent arithmetic: 10.25% Chicago tax, venue gratuity, 2026 CTA transit fares, and deterministic remainder cent distribution.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono text-[#18181b] border-collapse">
          <thead className="bg-[#ded7c7] text-[#18181b] uppercase text-[10px] tracking-wider border-b border-[#1c1917]">
            <tr>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Line Item</th>
              <th className="py-2 px-3 border-r border-[#d4cdbe]">Description</th>
              {ledger.memberLedgers.map((m: any, idx: number) => (
                <th key={idx} className="py-2 px-3 text-right border-r border-[#d4cdbe] last:border-r-0">
                  {m.alias}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cdbe] bg-[#f6f4ee]">
            {visibleRows.map(row => (
              <tr
                key={row.id}
                className={
                  row.isTotal
                    ? 'bg-[#ded7c7] font-bold text-[#18181b] border-t-2 border-b-2 border-[#1c1917]'
                    : 'hover:bg-[#ded7c7]/40 transition-colors'
                }
              >
                <td className="py-1.5 px-3 font-bold border-r border-[#d4cdbe] text-[#57534e]">{row.id}</td>
                <td className="py-1.5 px-3 border-r border-[#d4cdbe]">{row.name}</td>
                {ledger.memberLedgers.map((m: any, idx: number) => (
                  <td key={idx} className="py-1.5 px-3 text-right border-r border-[#d4cdbe] last:border-r-0 font-mono">
                    {row.isCap && m.LI10_MemberCapCents === null ? (
                      <span className="text-[#b91c1c] font-bold text-[10px] bg-[#fee2e2] px-1 py-0.5 border border-[#ef4444]">
                        {m.LI10_DisplayCap}
                      </span>
                    ) : (
                      `$${((m[row.key] ?? 0) / 100).toFixed(2)}`
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
