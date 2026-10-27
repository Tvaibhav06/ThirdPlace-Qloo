// tests/orchestrator.test.ts
// Unit tests for the bounded agent orchestrator, replan actions, and stop conditions (AC-03.4).

import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReplanAction, ReplanAction } from '../lib/agent/actions';
import { planNextActions } from '../lib/agent/planner';

const mockCatalog = [
  { id: 'v1', name: 'Expensive Bar', spend: { baseCents: 2500, lowCents: 2000 }, neighborhood: 'wicker_park' },
  { id: 'v2', name: 'Budget Cafe', spend: { baseCents: 900, lowCents: 400 }, neighborhood: 'logan_square' },
  { id: 'v3', name: 'Free Bookstore', spend: { baseCents: 0, lowCents: 0 }, neighborhood: 'wicker_park' }
];

const mockMembers = [
  { alias: 'M1', mode: 'drive', capCents: 1500, vibes: ['cozy', 'loud'] },
  { alias: 'M2', mode: 'bike', capCents: 2000, vibes: ['cozy'] }
];

test('Replan Action: SWITCH_TO_CHEAPER_VENUE filters pool to <= 1000 cents', () => {
  const action: ReplanAction = {
    type: 'SWITCH_TO_CHEAPER_VENUE',
    parameters: {},
    rationale: 'Budget breach'
  };

  const { updatedPool } = applyReplanAction(action, ['v1', 'v2', 'v3'], mockCatalog, mockMembers);
  assert.deepEqual(updatedPool, ['v2', 'v3'], 'Expensive venue v1 must be screened out');
});

test('Replan Action: SHIFT_NEIGHBORHOOD_CENTER restricts to target neighborhood', () => {
  const action: ReplanAction = {
    type: 'SHIFT_NEIGHBORHOOD_CENTER',
    parameters: { targetNeighborhood: 'logan_square' },
    rationale: 'Commute breach'
  };

  const { updatedPool } = applyReplanAction(action, ['v1', 'v2', 'v3'], mockCatalog, mockMembers);
  assert.deepEqual(updatedPool, ['v2'], 'Only logan_square venues retained');
});

test('Replan Action: SWAP_COMMUTE_MODE mutates designated member mode', () => {
  const action: ReplanAction = {
    type: 'SWAP_COMMUTE_MODE',
    parameters: { alias: 'M1', newMode: 'bike' },
    rationale: 'Commute swap'
  };

  const { updatedMembers } = applyReplanAction(action, ['v1', 'v2', 'v3'], mockCatalog, mockMembers);
  const m1 = updatedMembers.find(m => m.alias === 'M1');
  assert.equal(m1?.mode, 'bike');
});

test('Replan Action: RELAX_SOFT_TAG drops specified vibe tag without touching hard caps', () => {
  const action: ReplanAction = {
    type: 'RELAX_SOFT_TAG',
    parameters: { tag: 'loud' },
    rationale: 'Pool widening'
  };

  const { updatedMembers } = applyReplanAction(action, ['v1', 'v2', 'v3'], mockCatalog, mockMembers);
  const m1 = updatedMembers.find(m => m.alias === 'M1');
  assert.deepEqual(m1?.vibes, ['cozy']);
  assert.equal(m1?.capCents, 1500, 'Member budget cap must never be touched by agent');
});

test('AC-03.4: Bounded replan actions count max 3', async () => {
  const breaches = [
    { type: 'BUDGET_CAP_BREACH', details: 'All-in spend exceeds cap' }
  ];

  const actions = await planNextActions(breaches, ['v1', 'v2']);
  assert.ok(actions.length <= 3, 'AC-03.4: Replan action suggestions capped at 3');
});
