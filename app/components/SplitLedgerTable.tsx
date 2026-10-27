// app/components/SplitLedgerTable.tsx
// 13-row integer-cent pre-spend split ledger table (LI-01 to LI-13).

import React from 'react';

export function SplitLedgerTable({ ledger, isSolo }: { ledger: any; isSolo: boolean }) {
  if (!ledger?.memberLedgers?.length) return null;

  const rows = [
    { id: 'LI-01', name: 'Base Venue Spend', key: 'LI01_BaseVenueSpendCents' },
    { id: 'LI-02', name: 'Secondary Stop Spend', key: 'LI02_SecondaryStopSpendCents' },
    { id: 'LI-03', name: 'Live Event Ticket', key: 'LI03_LiveEventTicketCents' },
    { id: 'LI-04', name: 'Chicago Sales Tax (10.25%)', key: 'LI04_TaxCents' },
    { id: 'LI-05', name: 'Gratuity', key: 'LI05_GratuityCents' },
    { id: 'LI-06', name: 'Shared Items Remainder Cent Split', key: 'LI06_SharedGroupItemsCents' },
    { id: 'LI-07', name: 'Round-Trip Commute Fare', key: 'LI07_MemberCommuteCostCents' },
    { id: 'LI-08', name: 'Contingency Buffer (10%)', key: 'LI08_ContingencyCents' },
    { id: 'LI-09', name: 'Total Per-Person All-In Spend', key: 'LI09_TotalPerPersonAllInCents', isTotal: true },
    { id: 'LI-10', name: 'Member Budget Cap', key: 'LI10_MemberCapCents', isCap: true },
    { id: 'LI-11', name: 'Remaining Slack under Binding Floor', key: 'LI11_SlackCents' },
    { id: 'LI-12', name: 'Weekly Running Total (Solo Mode)', key: 'LI12_WeeklyRunningTotalCents', isTotal: isSolo },
    { id: 'LI-13', name: 'Weekly Savings vs BLS $58.17 Benchmark', key: 'LI13_WeeklySavingsVsBlsBenchmarkCents', isTotal: isSolo }
  ];

  const visibleRows = isSolo ? rows : rows.slice(0, 11);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">13-Row Itemized Pre-Spend Split Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict integer-cent arithmetic: 10.25% Chicago tax, venue gratuity, 2026 CTA fares, and deterministic remainder cent distribution.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Line Item</th>
              <th className="py-2.5 px-3">Description</th>
              {ledger.memberLedgers.map((m: any, idx: number) => (
                <th key={idx} className="py-2.5 px-3 text-right">
                  {m.alias}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {visibleRows.map(row => (
              <tr
                key={row.id}
                className={
                  row.isTotal
                    ? 'bg-slate-800/50 font-bold text-white'
                    : 'hover:bg-slate-800/20 transition-colors'
                }
              >
                <td className="py-2 px-3 text-slate-500 font-bold">{row.id}</td>
                <td className="py-2 px-3">{row.name}</td>
                {ledger.memberLedgers.map((m: any, idx: number) => (
                  <td key={idx} className="py-2 px-3 text-right">
                    {row.isCap && m.LI10_MemberCapCents === null
                      ? m.LI10_DisplayCap
                      : `$${((m[row.key] ?? 0) / 100).toFixed(2)}`}
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
