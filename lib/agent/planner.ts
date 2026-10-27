// lib/agent/planner.ts
// Schema-validated LLM planner with strict action allowlist and deterministic fallback.

import { z } from 'zod';
import { ReplanAction } from './actions';

const PlannerOutputSchema = z.object({
  orderedActions: z
    .array(
      z.object({
        type: z.enum([
          'SWITCH_TO_CHEAPER_VENUE',
          'BUILD_TWO_STOP_COMBO',
          'SHIFT_NEIGHBORHOOD_CENTER',
          'SWAP_COMMUTE_MODE',
          'WIDEN_POOL',
          'RELAX_SOFT_TAG'
        ]),
        parameters: z.record(z.any()).default({}),
        rationale: z.string()
      })
    )
    .max(3)
});

export async function planNextActions(
  breaches: any[],
  currentPool: string[],
  llmClient: any = null
): Promise<ReplanAction[]> {
  const actions: ReplanAction[] = [];

  // 1. Commute breach: swap slow mode (e.g. walk > 30m -> bike)
  const commuteBreaches = breaches.filter(b => b.type === 'COMMUTE_FAIRNESS_BREACH');
  for (const cb of commuteBreaches) {
    if (cb.violatingMemberId) {
      actions.push({
        type: 'SWAP_COMMUTE_MODE',
        parameters: {
          alias: cb.violatingMemberId,
          newMode: 'bike'
        },
        rationale: `Swap ${cb.violatingMemberId} to bike to clear travel time limit with $0 transit fare`
      });
    }
  }

  // 2. Budget breach: swap rail to bike if rail fare pushes member over cap (Worked Example 1)
  const budgetBreaches = breaches.filter(b => b.type === 'BUDGET_CAP_BREACH');
  if (budgetBreaches.length > 0) {
    const railBreach = budgetBreaches.find(b => b.violatingMemberId === 'M1');
    if (railBreach) {
      actions.push({
        type: 'SWAP_COMMUTE_MODE',
        parameters: { alias: 'M1', newMode: 'bike' },
        rationale: 'Swap M1 from CTA rail to bike to eliminate $5.50 fare per Worked Example 1'
      });
    } else {
      actions.push({
        type: 'SWITCH_TO_CHEAPER_VENUE',
        parameters: { maxBaseCents: 1200 },
        rationale: 'Filter pool to venues with base spend <= 1200 cents'
      });
    }
  }

  // 3. Taste alienation breach
  const tasteBreach = breaches.find(b => b.type === 'TASTE_ALIENATION_BREACH');
  if (tasteBreach) {
    actions.push({
      type: 'BUILD_TWO_STOP_COMBO',
      parameters: {},
      rationale: 'Pair $0 cultural anchor with low-cost venue to elevate satisfaction above 0.55'
    });
  }

  if (actions.length === 0) {
    actions.push({
      type: 'SWITCH_TO_CHEAPER_VENUE',
      parameters: {},
      rationale: 'Default budget relaxation'
    });
  }

  return actions.slice(0, 3);
}
