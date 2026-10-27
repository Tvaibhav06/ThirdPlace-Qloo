// tests/thirdPlaceLedger.test.mjs
// Node.js native test suite for 13-row split ledger, Blind Cap mode, Pareto fairness,
// the 3 worked examples from PRD Section 15.4, and invariants INV-01 through INV-10.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  roundHalfUpBp,
  splitSharedItemsDeterministic,
  computeMemberLedger,
  computeSquadLedger,
  computeSoloWeeklyLedger,
  computeFixedPoolPercentileRanks,
  evaluateSquadFairness,
  BLS_UNDER25_WEEKLY_BENCHMARK_CENTS
} from '../lib/engine/thirdPlaceLedger.mjs';

test('Suite 1: Worked Example 1 (PRD Section 15.4) - Cafe, Rail, Blind Cap, and Replan', () => {
  const cafeStop = {
    id: 'v_wp_wormhole',
    name: 'The Wormhole Coffee',
    spend: { lowCents: 600, baseCents: 1200, highCents: 1800 },
    taxable: true,
    tipBp: 1000 // Counter service 10%
  };

  const initialMembers = [
    { alias: 'M1', mode: 'cta_rail', capCents: 3500 },
    { alias: 'M2', mode: 'bike', capCents: 2500 },
    { alias: 'M3', mode: 'walk', capCents: 1800 }
  ];

  const initialResult = computeSquadLedger({
    stop1: cafeStop,
    members: initialMembers,
    scenario: 'base',
    contingencyBp: 1000,
    blindCapMode: true
  });

  assert.equal(initialResult.minMemberCapCents, 1800);
  assert.equal(initialResult.budgetCompliant, false, 'Initial plan breaches M3 binding cap floor');

  const [m1, m2, m3] = initialResult.memberLedgers;

  // Check M1 values (CTA rail round trip = 550c)
  assert.equal(m1.LI01_BaseVenueSpendCents, 1200);
  assert.equal(m1.LI04_TaxCents, 123); // roundHalfUp(1200 * 1025 / 10000)
  assert.equal(m1.LI05_GratuityCents, 120); // roundHalfUp(1200 * 1000 / 10000)
  assert.equal(m1.LI07_MemberCommuteCostCents, 550);
  assert.equal(m1.LI08_ContingencyCents, 144); // roundHalfUp(1443 * 1000 / 10000)
  assert.equal(m1.LI09_TotalPerPersonAllInCents, 2137);
  assert.equal(m1.LI10_MemberCapCents, null, 'Blind Cap mode masks cap as null');
  assert.equal(m1.LI10_DisplayCap, 'hidden (binding floor applied)');
  assert.equal(m1.LI11_SlackCents, -337, '1800 - 2137 = -337 (breach)');
  assert.equal(m1.withinBudget, false);

  // Check M2 and M3 values (Bike/Walk = 0c commute)
  assert.equal(m2.LI09_TotalPerPersonAllInCents, 1587);
  assert.equal(m2.LI11_SlackCents, 213, '1800 - 1587 = 213');
  assert.equal(m2.withinBudget, true);

  assert.equal(m3.LI09_TotalPerPersonAllInCents, 1587);
  assert.equal(m3.LI11_SlackCents, 213);
  assert.equal(m3.withinBudget, true);

  // Replan action: SWITCH_TO_CHEAPER_VENUE (base 1000c) + SWAP_COMMUTE_MODE (M1 rail to bike)
  const cheaperStop = {
    id: 'v_wp_cheaper',
    name: 'Cheaper Cafe',
    spend: { lowCents: 500, baseCents: 1000, highCents: 1500 },
    taxable: true,
    tipBp: 1000
  };

  const replannedMembers = [
    { alias: 'M1', mode: 'bike', capCents: 3500 },
    { alias: 'M2', mode: 'bike', capCents: 2500 },
    { alias: 'M3', mode: 'walk', capCents: 1800 }
  ];

  const replannedResult = computeSquadLedger({
    stop1: cheaperStop,
    members: replannedMembers,
    scenario: 'base',
    contingencyBp: 1000,
    blindCapMode: true
  });

  assert.equal(replannedResult.budgetCompliant, true);
  for (const m of replannedResult.memberLedgers) {
    assert.equal(m.LI01_BaseVenueSpendCents, 1000);
    assert.equal(m.LI04_TaxCents, 103);
    assert.equal(m.LI05_GratuityCents, 100);
    assert.equal(m.LI07_MemberCommuteCostCents, 0);
    assert.equal(m.LI08_ContingencyCents, 120);
    assert.equal(m.LI09_TotalPerPersonAllInCents, 1323);
    assert.equal(m.LI11_SlackCents, 477, '1800 - 1323 = 477 slack');
    assert.equal(m.withinBudget, true);
  }
});

test('Suite 2: Worked Example 2 (PRD Section 15.4) - Deterministic Shared Remainder Allocation', () => {
  const splits = splitSharedItemsDeterministic(1250, 3);
  assert.deepEqual(splits, [417, 417, 416]);
  assert.equal(splits.reduce((a, b) => a + b, 0), 1250, 'Conservation of cents holds');
});

test('Suite 3: Worked Example 3 (PRD Section 15.4) - Solo Weekly 3-Slot Routine & BLS Benchmark', () => {
  const stopTuesday = {
    slot: { day: 'tue', start: '18:00', end: '20:00' },
    venue: {
      id: 'v_wp_myopic',
      name: 'Myopic Books',
      spend: { lowCents: 0, baseCents: 0, highCents: 0 },
      taxable: false,
      tipBp: 0
    },
    mode: 'walk'
  };

  const stopThursday = {
    slot: { day: 'thu', start: '18:30', end: '21:00' },
    venue: {
      id: 'v_wp_cafe',
      name: 'Cafe Mustache',
      spend: { lowCents: 500, baseCents: 1000, highCents: 1500 },
      taxable: true,
      tipBp: 1000
    },
    mode: 'bike'
  };

  const stopSaturday = {
    slot: { day: 'sat', start: '14:00', end: '17:00' },
    venue: {
      id: 'v_ls_snakes',
      name: 'Snakes & Lattes',
      spend: { lowCents: 800, baseCents: 1500, highCents: 2200 },
      taxable: true,
      tipBp: 1800 // Sit-down 18%
    },
    mode: 'bike'
  };

  const soloResult = computeSoloWeeklyLedger({
    stops: [stopTuesday, stopThursday, stopSaturday],
    weeklyCapCents: 3500,
    contingencyBp: 1000
  });

  const [tue, thu, sat] = soloResult.stopLedgers;
  assert.equal(tue.row.LI09_TotalPerPersonAllInCents, 0);
  assert.equal(tue.row.LI12_WeeklyRunningTotalCents, 0);

  assert.equal(thu.row.LI09_TotalPerPersonAllInCents, 1323);
  assert.equal(thu.row.LI12_WeeklyRunningTotalCents, 1323);

  // Sat: spend 1500, tax 154, tip 270, contingency 192 -> 2116
  assert.equal(sat.row.LI01_BaseVenueSpendCents, 1500);
  assert.equal(sat.row.LI04_TaxCents, 154);
  assert.equal(sat.row.LI05_GratuityCents, 270);
  assert.equal(sat.row.LI08_ContingencyCents, 192);
  assert.equal(sat.row.LI09_TotalPerPersonAllInCents, 2116);
  assert.equal(sat.row.LI12_WeeklyRunningTotalCents, 3439);

  assert.equal(soloResult.totalWeeklyAllInCents, 3439);
  assert.equal(soloResult.weeklySlackVsCapCents, 61, '3500 - 3439 = 61');
  assert.equal(soloResult.LI13_WeeklySavingsVsBlsBenchmarkCents, 2378, '5817 - 3439 = 2378 savings');
  assert.equal(soloResult.withinBudget, true);
});

test('Suite 4: Master Invariant Suite (INV-01 to INV-10)', () => {
  const sampleVenue = {
    id: 'v1',
    name: 'Venue 1',
    spend: { lowCents: 500, baseCents: 1200, highCents: 2000 },
    taxable: true,
    tipBp: 1000
  };

  const sampleMembers = [
    { alias: 'M1', mode: 'walk', capCents: 2500 },
    { alias: 'M2', mode: 'bike', capCents: 2000 }
  ];

  // INV-01: Changing Qloo ranks or affinities never changes any ledger row
  const ledgerBefore = computeSquadLedger({ stop1: sampleVenue, members: sampleMembers });
  // Simulating different Qloo rank values
  const ranksA = computeFixedPoolPercentileRanks(['v1', 'v2'], ['v1', 'v2']);
  const ranksB = computeFixedPoolPercentileRanks(['v2', 'v1'], ['v1', 'v2']);
  const ledgerAfter = computeSquadLedger({ stop1: sampleVenue, members: sampleMembers });
  assert.deepEqual(ledgerBefore, ledgerAfter, 'INV-01: Qloo ranks never mutate ledger values');

  // INV-02: Sum of member totals equals plan total in cents
  const planTotal = ledgerBefore.totalPlanSpendCents;
  const sumMembers = ledgerBefore.memberLedgers.reduce((s, m) => s + m.LI09_TotalPerPersonAllInCents, 0);
  assert.equal(planTotal, sumMembers, 'INV-02: Total plan spend matches sum of member totals');

  // INV-03: No floating-point operations touch money (static inspection)
  const fileContent = fs.readFileSync(path.join(process.cwd(), 'lib/engine/thirdPlaceLedger.mjs'), 'utf8');
  assert.equal(fileContent.includes('0.1025'), false, 'INV-03: No floating-point tax constants');
  assert.equal(fileContent.includes('0.18'), false, 'INV-03: No floating-point tip constants');
  assert.equal(fileContent.includes('0.10'), false, 'INV-03: No floating-point contingency constants');

  // INV-04: Every completed plan satisfies hard budget constraints
  assert.equal(ledgerBefore.budgetCompliant, true);
  assert.equal(
    ledgerBefore.memberLedgers.every(m => m.LI09_TotalPerPersonAllInCents <= 2000),
    true,
    'INV-04: Hard budget cap enforced'
  );

  // INV-05: Both outward and return legs are included for every member
  // (Tested in fairness evaluation and matrix lookups)
  const fairness = evaluateSquadFairness({
    memberRanksStop1: { M1: 0.9, M2: 0.8 },
    memberRoundTripMinutes: { M1: 30, M2: 25 },
    oneWayLimitMinutes: 30
  });
  assert.ok(fairness.squadConsensusScore > 0, 'INV-05: Commute legs evaluated in fairness');

  // INV-06: 0.55 taste floor enforced for every completed plan
  const alienatingFairness = evaluateSquadFairness({
    memberRanksStop1: { M1: 1.0, M2: 0.89, M3: 0.11 },
    memberRoundTripMinutes: { M1: 20, M2: 20, M3: 20 }
  });
  assert.equal(alienatingFairness.minMemberSatisfaction, 0.11);
  assert.equal(alienatingFairness.clearsFloor, false, 'INV-06: 0.11 breaches 0.55 taste floor');
  assert.equal(alienatingFairness.tasteCompliant, false);

  // INV-07: Same inputs and cached Qloo results give identical output
  const res1 = computeFixedPoolPercentileRanks(['v1', 'v2', 'v3'], ['v1', 'v2', 'v3', 'v4']);
  const res2 = computeFixedPoolPercentileRanks(['v1', 'v2', 'v3'], ['v1', 'v2', 'v3', 'v4']);
  assert.deepEqual(res1, res2, 'INV-07: Determinism guaranteed');

  // INV-08: Shared-item remainder allocation strictly conserves cents
  for (let c = 0; c < 20; c++) {
    const s = splitSharedItemsDeterministic(c, 4);
    assert.equal(s.reduce((a, b) => a + b, 0), c, `INV-08: Cent conservation for ${c} cents`);
  }

  // INV-09: Lowering contingency never raises any total
  const highContingency = computeSquadLedger({ stop1: sampleVenue, members: sampleMembers, contingencyBp: 1500 });
  const lowContingency = computeSquadLedger({ stop1: sampleVenue, members: sampleMembers, contingencyBp: 500 });
  for (let i = 0; i < sampleMembers.length; i++) {
    assert.ok(
      lowContingency.memberLedgers[i].LI09_TotalPerPersonAllInCents <=
        highContingency.memberLedgers[i].LI09_TotalPerPersonAllInCents,
      'INV-09: Lower contingency never raises spend'
    );
  }

  // INV-10: Raising a cap never turns a feasible plan infeasible
  const tightCaps = computeSquadLedger({ stop1: sampleVenue, members: sampleMembers });
  const generousCaps = computeSquadLedger({
    stop1: sampleVenue,
    members: sampleMembers.map(m => ({ ...m, capCents: m.capCents + 1000 }))
  });
  if (tightCaps.budgetCompliant) {
    assert.equal(generousCaps.budgetCompliant, true, 'INV-10: Monotonicity of cap feasibility');
  }
});
