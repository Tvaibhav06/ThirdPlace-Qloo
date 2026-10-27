// lib/engine/ledgerWrapper.ts
// Typed TypeScript wrapper for pure ESM thirdPlaceLedger.mjs engine.

// @ts-ignore
import {
  computeSquadLedger,
  computeFixedPoolPercentileRanks,
  evaluateSquadFairness,
  roundHalfUpBp,
  splitSharedItemsDeterministic,
  BLS_UNDER25_WEEKLY_BENCHMARK_CENTS
} from './thirdPlaceLedger.mjs';

export interface LedgerMemberInput {
  alias: string; // 'M1' | 'M2' | 'M3' | 'M4'
  mode: 'walk' | 'bike' | 'cta_rail' | 'cta_bus' | 'drive' | 'rideshare';
  capCents: number;
  driveCostCents?: number;
}

export interface CatalogStopInput {
  id: string;
  name: string;
  subtype?: string;
  spend: { lowCents: number; baseCents: number; highCents: number };
  taxable: boolean;
  tipBp: number;
}

export function computeSquadLedgerTyped(params: {
  stop1: CatalogStopInput;
  stop2?: CatalogStopInput | null;
  liveEventTicketCents?: number;
  sharedGroupTotalCents?: number;
  members: LedgerMemberInput[];
  scenario?: 'low' | 'base' | 'high';
  contingencyBp?: number;
  ownCapMode?: boolean;
  blindCapMode?: boolean;
  priorWeeklyTotalCents?: number;
}) {
  return (computeSquadLedger as any)(params);
}

export function computeSoloWeeklyLedgerTyped(params: {
  stops: Array<{
    slot: { day: string; start: string; end: string };
    venue: CatalogStopInput;
    mode: LedgerMemberInput['mode'];
    driveCostCents?: number;
  }>;
  weeklyCapCents: number;
  scenario?: 'low' | 'base' | 'high';
  contingencyBp?: number;
}) {
  let runningTotalCents = 0;
  const stopLedgers = params.stops.map(s => {
    const res = computeSquadLedger({
      stop1: s.venue,
      members: [
        {
          alias: 'M1',
          mode: s.mode,
          capCents: params.weeklyCapCents,
          driveCostCents: s.driveCostCents ?? 0
        }
      ],
      scenario: params.scenario ?? 'base',
      contingencyBp: params.contingencyBp ?? 1000,
      ownCapMode: true,
      blindCapMode: false,
      priorWeeklyTotalCents: runningTotalCents
    });
    const row = res.memberLedgers[0];
    runningTotalCents = row.LI12_WeeklyRunningTotalCents;
    return { slot: s.slot, venueId: s.venue.id, venueName: s.venue.name, row };
  });

  const lastRow = stopLedgers.at(-1)?.row;
  const li12 = lastRow ? lastRow.LI12_WeeklyRunningTotalCents : 0;
  const li13 = BLS_UNDER25_WEEKLY_BENCHMARK_CENTS - li12;

  return {
    stopLedgers,
    LI12_WeeklyRunningTotalCents: li12,
    LI13_WeeklySavingsVsBlsBenchmarkCents: li13,
    weeklySlackCents: params.weeklyCapCents - li12,
    withinBudget: li12 <= params.weeklyCapCents
  };
}

export function computeFixedPoolPercentileRanksTyped(
  orderedReturnedIds: string[],
  poolIds: string[]
): Record<string, number> {
  return computeFixedPoolPercentileRanks(orderedReturnedIds, poolIds);
}

export function evaluateSquadFairnessTyped(params: {
  memberRanksStop1: Record<string, number>;
  memberRanksStop2?: Record<string, number> | null;
  memberRoundTripMinutes: Record<string, number>;
  oneWayLimitMinutes?: number;
  tasteFloor?: number;
  hostileStopCutoff?: number;
}) {
  return (evaluateSquadFairness as any)(params);
}

export { roundHalfUpBp, splitSharedItemsDeterministic, BLS_UNDER25_WEEKLY_BENCHMARK_CENTS };
