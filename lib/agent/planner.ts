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
  // Deterministic fallback order if LLM call fails or is not configured
  const defaultFallback: ReplanAction[] = [
    {
      type: 'SWITCH_TO_CHEAPER_VENUE',
      parameters: {},
      rationale: 'Deterministic budget breach fallback'
    },
    {
      type: 'BUILD_TWO_STOP_COMBO',
      parameters: {},
      rationale: 'Deterministic taste floor / combo fallback'
    }
  ];

  if (!llmClient) {
    return defaultFallback;
  }

  try {
    const summary = breaches.map(b => `${b.type}: ${b.details}`).join('\n');
    const prompt = `Given the following constraint violations, recommend up to 3 allowlisted actions from:
[SWITCH_TO_CHEAPER_VENUE, BUILD_TWO_STOP_COMBO, SHIFT_NEIGHBORHOOD_CENTER, SWAP_COMMUTE_MODE, WIDEN_POOL, RELAX_SOFT_TAG].
Violations:
${summary}`;

    const raw = await llmClient.completeStructured(prompt, PlannerOutputSchema);
    return raw.orderedActions;
  } catch {
    return defaultFallback;
  }
}
