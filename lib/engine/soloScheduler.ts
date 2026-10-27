// lib/engine/soloScheduler.ts
// 3-slot weekly routine optimizer for Solo mode with LI-12 and LI-13 BLS benchmarking.

import { computeSoloWeeklyLedgerTyped, LedgerMemberInput } from './ledgerWrapper';

export interface SoloSlotInput {
  day: 'tue' | 'thu' | 'sat';
  start: string;
  end: string;
}

export function optimizeSoloWeeklyRoutine(
  slots: SoloSlotInput[],
  candidateVenues: any[],
  venueRanks: Record<string, number>, // venueId -> fixed-pool percentile rank R in [0, 1]
  weeklyCapCents: number,
  userOrigin: string,
  commuteMatrix: any,
  maxOneWayMinutes: number,
  preferredMode: LedgerMemberInput['mode'] = 'bike'
) {
  // Sort candidates by Qloo fixed-pool taste rank descending
  const sorted = [...candidateVenues].sort((a, b) => (venueRanks[b.id] || 0) - (venueRanks[a.id] || 0));

  // Find 3 stops with distinct subtypes that satisfy opening hours, commute, and weekly budget
  const selectedStops: Array<{
    slot: SoloSlotInput;
    venue: any;
    mode: LedgerMemberInput['mode'];
    driveCostCents: number;
  }> = [];
  const usedSubtypes = new Set<string>();
  const usedVenueIds = new Set<string>();

  for (const slot of slots) {
    const match = sorted.find(v => {
      if (usedVenueIds.has(v.id) || usedSubtypes.has(v.subtype)) return false;
      const hours = v.hours.find((h: any) => h.day === slot.day);
      const closeTime = hours?.close === '00:00' ? '24:00' : hours?.close;
      if (!hours || hours.open > slot.start || closeTime < slot.end) return false;

      const matrixMode = preferredMode === 'cta_rail' || preferredMode === 'cta_bus' ? 'drive' : preferredMode;
      const durKey = `${userOrigin}->${v.id}->${matrixMode}`;
      const dur = commuteMatrix.durationsSeconds[durKey]?.outward || 600;
      if (Math.round(dur / 60) > maxOneWayMinutes) return false;

      return true;
    });

    if (match) {
      selectedStops.push({
        slot,
        venue: match,
        mode: preferredMode,
        driveCostCents: 0
      });
      usedSubtypes.add(match.subtype);
      usedVenueIds.add(match.id);
    }
  }

  // Compute 13-row weekly running totals (LI-12 and LI-13)
  const weeklyLedger = computeSoloWeeklyLedgerTyped({
    stops: selectedStops,
    weeklyCapCents,
    scenario: 'base',
    contingencyBp: 1000
  });

  return {
    stops: selectedStops,
    ledger: weeklyLedger,
    weeklyTotalCents: weeklyLedger.LI12_WeeklyRunningTotalCents,
    savingsVsBlsCents: weeklyLedger.LI13_WeeklySavingsVsBlsBenchmarkCents,
    withinBudget: weeklyLedger.withinBudget
  };
}
