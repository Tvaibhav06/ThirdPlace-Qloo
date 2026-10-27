// lib/engine/validator.ts
// Deterministic constraint validator for budget caps, outward/return commute limits,
// venue hours, hard dietary/accessibility filters, and the 0.55 Pareto taste floor.

import { computeSquadLedgerTyped, evaluateSquadFairnessTyped, LedgerMemberInput } from './ledgerWrapper';

export interface ValidationRequest {
  members: Array<{
    alias: string; // 'M1' | 'M2' | 'M3' | 'M4'
    origin: string;
    mode: LedgerMemberInput['mode'];
    capCents: number;
    driveCostCents?: number;
    hardFilters: string[]; // e.g. ["wheelchair_accessible", "vegetarian_options"]
  }>;
  candidateVenue: any;
  secondaryVenue?: any | null;
  commuteMatrix: any;
  maxOneWayMinutes: number;
  timeWindow: { day: string; start: string; end: string };
  memberRanks: Record<string, Record<string, number>>; // alias -> venueId -> R(m,v)
  scenario?: 'low' | 'base' | 'high';
  contingencyBp?: number;
  sharedGroupTotalCents?: number;
  liveEventTicketCents?: number;
  ownCapMode?: boolean;
  blindCapMode?: boolean;
}

export interface ValidationVerdict {
  valid: boolean;
  breaches: Array<{
    type:
      | 'BUDGET_CAP_BREACH'
      | 'COMMUTE_FAIRNESS_BREACH'
      | 'TASTE_ALIENATION_BREACH'
      | 'HOURS_CLOSED'
      | 'HARD_FILTER_MISMATCH';
    details: string;
    violatingMemberId?: string;
  }>;
  ledger: ReturnType<typeof computeSquadLedgerTyped>;
  fairness: ReturnType<typeof evaluateSquadFairnessTyped>;
  memberCommuteLegs: Record<
    string,
    { outwardMin: number; returnMin: number; roundTripMin: number; transitTimeModeled: boolean }
  >;
}

export function validateCandidatePlan(req: ValidationRequest): ValidationVerdict {
  const breaches: ValidationVerdict['breaches'] = [];

  // 1. Hard opening hours check (Stop 1 and optional Stop 2)
  const checkHours = (venue: any) => {
    const hours = venue.hours.find((h: any) => h.day === req.timeWindow.day);
    const closeTime = hours?.close === '00:00' ? '24:00' : hours?.close;
    if (!hours || hours.open > req.timeWindow.start || closeTime < req.timeWindow.end) {
      breaches.push({
        type: 'HOURS_CLOSED',
        details: `${venue.name} is not open for full window ${req.timeWindow.start}-${req.timeWindow.end}`
      });
    }
  };
  checkHours(req.candidateVenue);
  if (req.secondaryVenue) checkHours(req.secondaryVenue);

  // 2. Hard dietary and accessibility filters
  for (const member of req.members) {
    for (const filter of member.hardFilters) {
      if (!req.candidateVenue.tags.includes(filter)) {
        breaches.push({
          type: 'HARD_FILTER_MISMATCH',
          details: `${req.candidateVenue.name} lacks required tag: ${filter}`,
          violatingMemberId: member.alias
        });
      }
    }
  }

  // 3. Commute limits check (Outward and Return legs must EACH be <= maxOneWayMinutes)
  const roundTripMinutes: Record<string, number> = {};
  const memberCommuteLegs: ValidationVerdict['memberCommuteLegs'] = {};

  for (const m of req.members) {
    const isTransit = m.mode === 'cta_rail' || m.mode === 'cta_bus';
    const matrixMode = isTransit || m.mode === 'rideshare' ? 'drive' : m.mode;
    const key = `${m.origin}->${req.candidateVenue.id}->${matrixMode}`;
    const durations = req.commuteMatrix.durationsSeconds[key] || { outward: 900, return: 900 };
    const outwardMin = Math.round(durations.outward / 60);
    const returnMin = Math.round(durations.return / 60);

    let interVenueMin = 0;
    if (req.secondaryVenue) {
      const interKey = `${req.candidateVenue.id}->${req.secondaryVenue.id}->walk`;
      interVenueMin = Math.round((req.commuteMatrix.interVenueSeconds?.[interKey] ?? 480) / 60);
    }

    roundTripMinutes[m.alias] = outwardMin + returnMin + interVenueMin;
    memberCommuteLegs[m.alias] = {
      outwardMin,
      returnMin,
      roundTripMin: roundTripMinutes[m.alias],
      transitTimeModeled: !isTransit
    };

    if (outwardMin > req.maxOneWayMinutes || returnMin > req.maxOneWayMinutes) {
      breaches.push({
        type: 'COMMUTE_FAIRNESS_BREACH',
        details: `Member ${m.alias} commute exceeds ${req.maxOneWayMinutes}m one-way limit (Out: ${outwardMin}m, Ret: ${returnMin}m)`,
        violatingMemberId: m.alias
      });
    }
  }

  // 4. Deterministic 13-row ledger and Budget Cap validation
  const ledger = computeSquadLedgerTyped({
    stop1: req.candidateVenue,
    stop2: req.secondaryVenue ?? null,
    liveEventTicketCents: req.liveEventTicketCents ?? 0,
    sharedGroupTotalCents: req.sharedGroupTotalCents ?? 0,
    members: req.members.map(m => ({
      alias: m.alias,
      mode: m.mode,
      capCents: m.capCents,
      driveCostCents: m.driveCostCents ?? 0
    })),
    scenario: req.scenario ?? 'base',
    contingencyBp: req.contingencyBp ?? 1000,
    ownCapMode: req.ownCapMode ?? false,
    blindCapMode: req.blindCapMode ?? true
  });

  if (!ledger.budgetCompliant) {
    for (const row of ledger.memberLedgers) {
      if (!row.withinBudget) {
        breaches.push({
          type: 'BUDGET_CAP_BREACH',
          details: `Member ${row.alias} all-in spend ${row.LI09_TotalPerPersonAllInCents}c exceeds binding cap floor ${ledger.minMemberCapCents}c (slack: ${row.LI11_SlackCents}c)`,
          violatingMemberId: row.alias
        });
      }
    }
  }

  // 5. Pareto Taste Fairness check (Fix F-02: minMemberSatisfaction >= 0.55 and zero hostile stops < 0.40)
  const memberRanksStop1: Record<string, number> = {};
  const memberRanksStop2: Record<string, number> | null = req.secondaryVenue ? {} : null;

  for (const m of req.members) {
    memberRanksStop1[m.alias] = req.memberRanks[m.alias]?.[req.candidateVenue.id] ?? 0;
    if (req.secondaryVenue && memberRanksStop2) {
      memberRanksStop2[m.alias] = req.memberRanks[m.alias]?.[req.secondaryVenue.id] ?? 0;
    }
  }

  const fairness = evaluateSquadFairnessTyped({
    memberRanksStop1,
    memberRanksStop2,
    memberRoundTripMinutes: roundTripMinutes,
    oneWayLimitMinutes: req.maxOneWayMinutes,
    tasteFloor: 0.55,
    hostileStopCutoff: 0.40
  });

  if (!fairness.tasteCompliant) {
    const worstAlias = Object.entries(fairness.effectiveRanks).sort(
      (a, b) => (a[1] as number) - (b[1] as number)
    )[0]?.[0];
    breaches.push({
      type: 'TASTE_ALIENATION_BREACH',
      details: `Min member satisfaction (${fairness.minMemberSatisfaction.toFixed(3)}) < 0.55 or hostile stop (< 0.40) detected (${fairness.hostileFlags.length} hostile flags)`,
      violatingMemberId: worstAlias
    });
  }

  return {
    valid: breaches.length === 0,
    breaches,
    ledger,
    fairness,
    memberCommuteLegs
  };
}
