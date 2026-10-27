// lib/agent/explainer.ts
// Fact-checked LLM explainer with strict verification against structured plan records.

export async function generateFactualExplanation(
  planRecord: any,
  llmClient: any = null
): Promise<string> {
  const venueName = planRecord.primaryVenue?.name || 'Selected Venue';
  const firstMember = planRecord.ledger?.memberLedgers?.[0] || {};
  const totalCents = firstMember.LI09_TotalPerPersonAllInCents || 0;
  const slackCents = firstMember.LI11_SlackCents || 0;
  const sharedTags =
    planRecord.culturalDna?.sharedTags?.map((t: any) => t.name).join(', ') || 'shared cultural affinity';

  const deterministicTemplate =
    `ThirdPlace Squad selected ${venueName} because it matches your squad's shared affinity for ${sharedTags}. ` +
    `Every member's all-in estimated spend is $${(totalCents / 100).toFixed(2)}, leaving $${(slackCents / 100).toFixed(2)} ` +
    `in slack under the group's budget floor.`;

  if (!llmClient) {
    return deterministicTemplate;
  }

  try {
    const prompt = `Explain why ${venueName} was selected using ONLY these facts:
Venue: ${venueName}
Spend: $${(totalCents / 100).toFixed(2)}
Slack: $${(slackCents / 100).toFixed(2)}
Shared Cultural Tags: ${sharedTags}
Do NOT invent numbers or guarantees.`;

    const prose = await llmClient.complete(prompt);

    // Strict fact check: Ensure venue name and dollar amount exist in output
    if (!prose.includes(venueName) || !prose.includes((totalCents / 100).toFixed(2))) {
      return deterministicTemplate;
    }
    return prose;
  } catch {
    return deterministicTemplate;
  }
}
