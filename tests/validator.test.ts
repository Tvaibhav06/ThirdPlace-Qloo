// tests/validator.test.ts
// Unit tests for constraint validator (AC-03.1 to AC-03.5).

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCandidatePlan } from '../lib/engine/validator';

const mockVenue = {
  id: 'v_wp_cafe',
  name: 'Test Cafe',
  neighborhood: 'wicker_park',
  spend: { lowCents: 600, baseCents: 1400, highCents: 2000 },
  taxable: true,
  tipBp: 1000,
  tags: ['coffee', 'wheelchair_accessible'],
  hours: [
    { day: 'tue', open: '08:00', close: '22:00' }
  ]
};

const mockMatrix = {
  durationsSeconds: {
    'wicker_park->v_wp_cafe->walk': { outward: 600, return: 600 },
    'hyde_park->v_wp_cafe->walk': { outward: 2400, return: 2400 } // 40m each way
  }
};

test('AC-03.1: Budget Cap Breach Detection', () => {
  const req = {
    members: [
      { alias: 'M1', origin: 'wicker_park', mode: 'walk' as const, capCents: 1000, hardFilters: [] }
    ],
    candidateVenue: mockVenue,
    commuteMatrix: mockMatrix,
    maxOneWayMinutes: 30,
    timeWindow: { day: 'tue', start: '18:00', end: '20:00' },
    memberRanks: { M1: { v_wp_cafe: 0.9 } },
    blindCapMode: true
  };

  const verdict = validateCandidatePlan(req);
  assert.equal(verdict.valid, false);
  const budgetBreach = verdict.breaches.find(b => b.type === 'BUDGET_CAP_BREACH');
  assert.ok(budgetBreach, 'AC-03.1: BUDGET_CAP_BREACH must fire when spend exceeds cap');
});

test('AC-03.2: Commute Limit Breach Detection', () => {
  const req = {
    members: [
      { alias: 'M1', origin: 'hyde_park', mode: 'walk' as const, capCents: 3500, hardFilters: [] }
    ],
    candidateVenue: mockVenue,
    commuteMatrix: mockMatrix,
    maxOneWayMinutes: 25, // 40m > 25m limit
    timeWindow: { day: 'tue', start: '18:00', end: '20:00' },
    memberRanks: { M1: { v_wp_cafe: 0.9 } },
    blindCapMode: true
  };

  const verdict = validateCandidatePlan(req);
  assert.equal(verdict.valid, false);
  const commuteBreach = verdict.breaches.find(b => b.type === 'COMMUTE_FAIRNESS_BREACH');
  assert.ok(commuteBreach, 'AC-03.2: COMMUTE_FAIRNESS_BREACH must fire when one-way exceeds limit');
});

test('AC-03.3: Pareto Taste Alienation Breach Detection', () => {
  const req = {
    members: [
      { alias: 'M1', origin: 'wicker_park', mode: 'walk' as const, capCents: 3500, hardFilters: [] },
      { alias: 'M2', origin: 'wicker_park', mode: 'walk' as const, capCents: 3500, hardFilters: [] }
    ],
    candidateVenue: mockVenue,
    commuteMatrix: mockMatrix,
    maxOneWayMinutes: 30,
    timeWindow: { day: 'tue', start: '18:00', end: '20:00' },
    memberRanks: {
      M1: { v_wp_cafe: 0.95 },
      M2: { v_wp_cafe: 0.35 } // 0.35 < 0.55 taste floor and < 0.40 hostile stop
    },
    blindCapMode: true
  };

  const verdict = validateCandidatePlan(req);
  assert.equal(verdict.valid, false);
  const tasteBreach = verdict.breaches.find(b => b.type === 'TASTE_ALIENATION_BREACH');
  assert.ok(tasteBreach, 'AC-03.3: TASTE_ALIENATION_BREACH must fire when rank < 0.55');
});

test('Hard Opening Hours Breach Detection', () => {
  const req = {
    members: [
      { alias: 'M1', origin: 'wicker_park', mode: 'walk' as const, capCents: 3500, hardFilters: [] }
    ],
    candidateVenue: mockVenue,
    commuteMatrix: mockMatrix,
    maxOneWayMinutes: 30,
    timeWindow: { day: 'tue', start: '22:30', end: '23:30' }, // Closes at 22:00
    memberRanks: { M1: { v_wp_cafe: 0.9 } },
    blindCapMode: true
  };

  const verdict = validateCandidatePlan(req);
  assert.equal(verdict.valid, false);
  const hoursBreach = verdict.breaches.find(b => b.type === 'HOURS_CLOSED');
  assert.ok(hoursBreach, 'HOURS_CLOSED must fire when venue is closed during window');
});

test('Hard Filter Mismatch Detection', () => {
  const req = {
    members: [
      { alias: 'M1', origin: 'wicker_park', mode: 'walk' as const, capCents: 3500, hardFilters: ['vegan_certified'] }
    ],
    candidateVenue: mockVenue,
    commuteMatrix: mockMatrix,
    maxOneWayMinutes: 30,
    timeWindow: { day: 'tue', start: '18:00', end: '20:00' },
    memberRanks: { M1: { v_wp_cafe: 0.9 } },
    blindCapMode: true
  };

  const verdict = validateCandidatePlan(req);
  assert.equal(verdict.valid, false);
  const filterBreach = verdict.breaches.find(b => b.type === 'HARD_FILTER_MISMATCH');
  assert.ok(filterBreach, 'HARD_FILTER_MISMATCH must fire when venue lacks required tag');
});
