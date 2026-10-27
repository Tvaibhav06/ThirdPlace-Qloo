// lib/engine/thirdPlaceLedger.mjs
// Pure ESM implementation of the 13-row integer-cent split ledger, Blind Cap privacy masking,
// Fixed-Pool within-query percentile rank (Fix F-01), and Pareto fairness (Fix F-02).
// Zero floating-point arithmetic touches money.

export const BLS_UNDER25_WEEKLY_BENCHMARK_CENTS = 5817; // $58.17/week (2024 BLS CXUFOODAWAYLB0402M)
export const CHICAGO_SALES_TAX_BP = 1025; // 10.25% Chicago sales tax
export const CTA_RAIL_ROUND_TRIP_CENTS = 550; // $2.75 each way (2026 CTA rail)
export const CTA_BUS_ROUND_TRIP_CENTS = 500; // $2.50 each way (2026 CTA bus)

/**
 * Deterministic half-up integer rounding:
 * roundHalfUp(x * bp / 10000) = floor((x * bp + 5000) / 10000)
 */
export function roundHalfUpBp(cents, bp) {
  if (cents <= 0 || bp <= 0) return 0;
  return Math.floor((cents * bp + 5000) / 10000);
}

/**
 * Splits shared item cents deterministically among N members.
 * Remainder cents are allocated 1 cent each in ascending member order (M1, M2, ...).
 */
export function splitSharedItemsDeterministic(sharedCents, nMembers) {
  if (nMembers <= 0) return [];
  if (sharedCents <= 0) return new Array(nMembers).fill(0);

  const base = Math.floor(sharedCents / nMembers);
  const remainder = sharedCents % nMembers;
  const result = new Array(nMembers);

  for (let i = 0; i < nMembers; i++) {
    result[i] = i < remainder ? base + 1 : base;
  }
  return result;
}

/**
 * Computes commute cost in integer cents based on transit mode.
 */
export function getCommuteCostCents(mode, customDriveCostCents = 0) {
  switch (mode) {
    case 'cta_rail':
      return CTA_RAIL_ROUND_TRIP_CENTS;
    case 'cta_bus':
      return CTA_BUS_ROUND_TRIP_CENTS;
    case 'walk':
    case 'bike':
      return 0;
    case 'drive':
    case 'rideshare':
      return Math.max(0, Math.round(customDriveCostCents));
    default:
      return 0;
  }
}

/**
 * Resolves spend cents for a venue based on scenario tier (low, base, high).
 */
export function getVenueSpendCents(venue, scenario = 'base') {
  if (!venue || !venue.spend) return 0;
  if (scenario === 'low') return venue.spend.lowCents ?? venue.spend.baseCents;
  if (scenario === 'high') return venue.spend.highCents ?? venue.spend.baseCents;
  return venue.spend.baseCents ?? 0;
}

/**
 * Computes the 13-row ledger for a single member in a hangout plan.
 */
export function computeMemberLedger({
  alias,
  mode,
  capCents,
  driveCostCents = 0,
  stop1,
  stop2 = null,
  liveEventTicketCents = 0,
  sharedItemCents = 0,
  scenario = 'base',
  contingencyBp = 1000,
  bindingCapFloorCents,
  ownCapMode = false,
  blindCapMode = true,
  priorWeeklyTotalCents = 0
}) {
  // LI-01: Base Venue Spend
  const LI01_BaseVenueSpendCents = getVenueSpendCents(stop1, scenario);

  // LI-02: Secondary Stop Spend
  const LI02_SecondaryStopSpendCents = stop2 ? getVenueSpendCents(stop2, scenario) : 0;

  // LI-03: Live Event Ticket
  const LI03_LiveEventTicketCents = Math.max(0, liveEventTicketCents);

  // LI-04: Chicago Sales Tax (10.25% on taxable spend)
  const taxableSpend1 = stop1.taxable ? LI01_BaseVenueSpendCents : 0;
  const taxableSpend2 = (stop2 && stop2.taxable) ? LI02_SecondaryStopSpendCents : 0;
  const LI04_TaxCents = roundHalfUpBp(taxableSpend1 + taxableSpend2, CHICAGO_SALES_TAX_BP);

  // LI-05: Gratuity (venue tip basis points applied to food/beverage)
  const tip1 = roundHalfUpBp(LI01_BaseVenueSpendCents, stop1.tipBp ?? 0);
  const tip2 = stop2 ? roundHalfUpBp(LI02_SecondaryStopSpendCents, stop2.tipBp ?? 0) : 0;
  const LI05_GratuityCents = tip1 + tip2;

  // LI-06: Shared Group Items (deterministic remainder cent split)
  const LI06_SharedGroupItemsCents = Math.max(0, sharedItemCents);

  // LI-07: Member Commute Fare
  const LI07_MemberCommuteCostCents = getCommuteCostCents(mode, driveCostCents);

  // Subtotal for contingency calculation (rows 1 to 6)
  const contingencySubtotal =
    LI01_BaseVenueSpendCents +
    LI02_SecondaryStopSpendCents +
    LI03_LiveEventTicketCents +
    LI04_TaxCents +
    LI05_GratuityCents +
    LI06_SharedGroupItemsCents;

  // LI-08: Contingency Buffer
  const LI08_ContingencyCents = roundHalfUpBp(contingencySubtotal, contingencyBp);

  // LI-09: Total Per-Person All-In Spend
  const LI09_TotalPerPersonAllInCents =
    contingencySubtotal + LI07_MemberCommuteCostCents + LI08_ContingencyCents;

  // LI-10: Member Budget Cap (Masked if Blind Cap Mode is active)
  let LI10_MemberCapCents = capCents;
  let LI10_DisplayCap = `$${(capCents / 100).toFixed(2)}`;
  if (blindCapMode) {
    LI10_MemberCapCents = null;
    LI10_DisplayCap = 'hidden (binding floor applied)';
  }

  // LI-11: Remaining Slack under Binding Floor
  const effectiveCapCents = ownCapMode ? capCents : bindingCapFloorCents;
  const LI11_SlackCents = effectiveCapCents - LI09_TotalPerPersonAllInCents;

  // LI-12: Weekly Running Total (Solo Mode)
  const LI12_WeeklyRunningTotalCents = priorWeeklyTotalCents + LI09_TotalPerPersonAllInCents;

  // LI-13: Weekly Savings vs BLS Under-25 Benchmark (Solo Mode)
  const LI13_WeeklySavingsVsBlsBenchmarkCents =
    BLS_UNDER25_WEEKLY_BENCHMARK_CENTS - LI12_WeeklyRunningTotalCents;

  const withinBudget = LI09_TotalPerPersonAllInCents <= effectiveCapCents;

  return {
    alias,
    mode,
    withinBudget,
    LI01_BaseVenueSpendCents,
    LI02_SecondaryStopSpendCents,
    LI03_LiveEventTicketCents,
    LI04_TaxCents,
    LI05_GratuityCents,
    LI06_SharedGroupItemsCents,
    LI07_MemberCommuteCostCents,
    LI08_ContingencyCents,
    LI09_TotalPerPersonAllInCents,
    LI10_MemberCapCents,
    LI10_DisplayCap,
    LI11_SlackCents,
    LI12_WeeklyRunningTotalCents,
    LI13_WeeklySavingsVsBlsBenchmarkCents
  };
}

/**
 * Computes squad ledger across all members.
 */
export function computeSquadLedger({
  stop1,
  stop2 = null,
  liveEventTicketCents = 0,
  sharedGroupTotalCents = 0,
  members,
  scenario = 'base',
  contingencyBp = 1000,
  ownCapMode = false,
  blindCapMode = true,
  priorWeeklyTotalCents = 0
}) {
  const minMemberCapCents = Math.min(...members.map(m => m.capCents));
  const sharedAllocations = splitSharedItemsDeterministic(sharedGroupTotalCents, members.length);

  const memberLedgers = members.map((m, idx) => {
    return computeMemberLedger({
      alias: m.alias || `M${idx + 1}`,
      mode: m.mode,
      capCents: m.capCents,
      driveCostCents: m.driveCostCents ?? 0,
      stop1,
      stop2,
      liveEventTicketCents,
      sharedItemCents: sharedAllocations[idx],
      scenario,
      contingencyBp,
      bindingCapFloorCents: minMemberCapCents,
      ownCapMode,
      blindCapMode,
      priorWeeklyTotalCents
    });
  });

  const totalPlanSpendCents = memberLedgers.reduce(
    (sum, m) => sum + m.LI09_TotalPerPersonAllInCents,
    0
  );

  const budgetCompliant = memberLedgers.every(m => m.withinBudget);

  return {
    stop1,
    stop2,
    minMemberCapCents,
    totalPlanSpendCents,
    budgetCompliant,
    memberLedgers
  };
}

/**
 * Computes Solo weekly ledger across 3 slots.
 */
export function computeSoloWeeklyLedger({
  stops,
  weeklyCapCents,
  scenario = 'base',
  contingencyBp = 1000
}) {
  let runningTotalCents = 0;
  const stopLedgers = stops.map(s => {
    const res = computeSquadLedger({
      stop1: s.venue,
      members: [
        {
          alias: 'M1',
          mode: s.mode,
          capCents: weeklyCapCents,
          driveCostCents: s.driveCostCents ?? 0
        }
      ],
      scenario,
      contingencyBp,
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
    totalWeeklyAllInCents: li12,
    weeklySlackVsCapCents: weeklyCapCents - li12,
    LI12_WeeklyRunningTotalCents: li12,
    LI13_WeeklySavingsVsBlsBenchmarkCents: li13,
    withinBudget: li12 <= weeklyCapCents
  };
}

/**
 * Fix F-01: Fixed-pool within-query percentile rank.
 * Denominator is locked to N_pool - 1.
 * Omitted venues receive tied bottom position (k + 1 + N_pool) / 2.
 */
export function computeFixedPoolPercentileRanks(orderedReturnedIds, poolIds) {
  const nPool = poolIds.length;
  if (nPool <= 0) return {};
  if (nPool === 1) return { [poolIds[0]]: 1.0 };

  const poolSet = new Set(poolIds);
  const filteredReturned = orderedReturnedIds.filter(id => poolSet.has(id));
  const k = filteredReturned.length;

  const ranks = {};
  filteredReturned.forEach((id, idx) => {
    const pos = idx + 1; // 1-based position
    ranks[id] = 1 - (pos - 1) / (nPool - 1);
  });

  // Assign tied bottom position to unscored pool venues
  const posUnscored = (k + 1 + nPool) / 2;
  const unscoredRank = Math.max(0, 1 - (posUnscored - 1) / (nPool - 1));

  poolIds.forEach(id => {
    if (ranks[id] === undefined) {
      ranks[id] = unscoredRank;
    }
  });

  return ranks;
}

/**
 * Fix F-02: Weighted 2-stop combo Pareto fairness evaluation.
 * Combo rank: R(m, combo) = 0.65 * max + 0.35 * min.
 * Hostile-stop warning: any stop where R(m, s) < 0.40.
 * Taste floor: minMemberSatisfaction >= 0.55.
 */
export function evaluateSquadFairness({
  memberRanksStop1,
  memberRanksStop2 = null,
  memberRoundTripMinutes,
  oneWayLimitMinutes = 30,
  tasteFloor = 0.55,
  hostileStopCutoff = 0.40
}) {
  const members = Object.keys(memberRanksStop1);
  const effectiveRanks = {};
  const hostileFlags = [];

  for (const m of members) {
    const r1 = memberRanksStop1[m] ?? 0;
    if (r1 < hostileStopCutoff) {
      hostileFlags.push({ member: m, stop: 1, rank: r1 });
    }

    if (memberRanksStop2) {
      const r2 = memberRanksStop2[m] ?? 0;
      if (r2 < hostileStopCutoff) {
        hostileFlags.push({ member: m, stop: 2, rank: r2 });
      }
      effectiveRanks[m] = 0.65 * Math.max(r1, r2) + 0.35 * Math.min(r1, r2);
    } else {
      effectiveRanks[m] = r1;
    }
  }

  const rankValues = Object.values(effectiveRanks);
  const minMemberSatisfaction = rankValues.length > 0 ? Math.min(...rankValues) : 0;
  const meanSatisfaction =
    rankValues.length > 0 ? rankValues.reduce((a, b) => a + b, 0) / rankValues.length : 0;

  // Normalized commute spread
  const rtValues = Object.values(memberRoundTripMinutes);
  const maxRt = rtValues.length > 0 ? Math.max(...rtValues) : 0;
  const minRt = rtValues.length > 0 ? Math.min(...rtValues) : 0;
  const spread = maxRt - minRt;
  const maxSpreadBound = Math.max(1, 2 * oneWayLimitMinutes);
  const normalizedCommuteSpread = Math.min(1, Math.max(0, spread / maxSpreadBound));

  // Consensus objective formula
  const squadConsensusScore =
    0.50 * minMemberSatisfaction +
    0.30 * meanSatisfaction +
    0.20 * (1 - normalizedCommuteSpread);

  const clearsFloor = minMemberSatisfaction >= tasteFloor && hostileFlags.length === 0;

  return {
    effectiveRanks,
    minMemberSatisfaction,
    meanSatisfaction,
    normalizedCommuteSpread,
    squadConsensusScore,
    hostileFlags,
    clearsFloor,
    tasteCompliant: clearsFloor
  };
}
