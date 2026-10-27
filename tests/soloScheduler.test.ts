// tests/soloScheduler.test.ts
// Unit tests for Solo mode 3-slot weekly routine optimization and LI-12/LI-13 BLS benchmark calculations.

import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizeSoloWeeklyRoutine, SoloSlotInput } from '../lib/engine/soloScheduler';
import fs from 'node:fs';
import path from 'node:path';

const catalog = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/chicago_catalog.json'), 'utf8')
);
const commuteMatrix = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/chicago_commute_matrix.json'), 'utf8')
);

test('Solo Weekly Scheduler: Selects 3 distinct subtype stops satisfying hours and commute', () => {
  const slots: SoloSlotInput[] = [
    { day: 'tue', start: '18:00', end: '20:00' },
    { day: 'thu', start: '19:00', end: '21:00' },
    { day: 'sat', start: '14:00', end: '17:00' }
  ];

  // Mock Qloo fixed-pool percentile ranks
  const venueRanks: Record<string, number> = {};
  catalog.forEach((v: any, idx: number) => {
    venueRanks[v.id] = (catalog.length - 1 - idx) / (catalog.length - 1);
  });

  const weeklyCapCents = 6000; // $60.00
  const userOrigin = 'logan_square';
  const maxOneWayMinutes = 35;

  const result = optimizeSoloWeeklyRoutine(
    slots,
    catalog,
    venueRanks,
    weeklyCapCents,
    userOrigin,
    commuteMatrix,
    maxOneWayMinutes,
    'bike'
  );

  assert.equal(result.stops.length, 3);

  // Subtypes must all be distinct
  const subtypes = new Set(result.stops.map(s => s.venue.subtype));
  assert.equal(subtypes.size, 3);

  // Venues must be distinct
  const venueIds = new Set(result.stops.map(s => s.venue.id));
  assert.equal(venueIds.size, 3);

  // Within budget check
  assert.ok(result.withinBudget);
  assert.ok(result.weeklyTotalCents <= weeklyCapCents);

  // Verify LI-12 and LI-13
  assert.ok(result.weeklyTotalCents > 0);
  assert.equal(
    result.savingsVsBlsCents,
    5817 - result.weeklyTotalCents
  );
  assert.equal(result.ledger.LI12_WeeklyRunningTotalCents, result.weeklyTotalCents);
  assert.equal(result.ledger.LI13_WeeklySavingsVsBlsBenchmarkCents, result.savingsVsBlsCents);
});

test('Solo Weekly Scheduler: Respects tight budget cap and flags over-budget routines', () => {
  const slots: SoloSlotInput[] = [
    { day: 'tue', start: '18:00', end: '20:00' },
    { day: 'thu', start: '19:00', end: '21:00' },
    { day: 'sat', start: '14:00', end: '17:00' }
  ];

  const venueRanks: Record<string, number> = {};
  catalog.forEach((v: any, idx: number) => {
    venueRanks[v.id] = (catalog.length - 1 - idx) / (catalog.length - 1);
  });

  // Extremely low cap ($5.00 = 500 cents) that 3 paid stops cannot clear
  const tightCapCents = 500;
  const result = optimizeSoloWeeklyRoutine(
    slots,
    catalog,
    venueRanks,
    tightCapCents,
    'wicker_park',
    commuteMatrix,
    30,
    'walk'
  );

  assert.equal(result.withinBudget, false);
  assert.ok(result.weeklyTotalCents > tightCapCents);
});
