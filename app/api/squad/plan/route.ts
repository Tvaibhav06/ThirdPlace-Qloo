// app/api/squad/plan/route.ts
// SSE streaming agent orchestrator for Squad Hangout consensus.

import { NextRequest } from 'next/server';
import { HttpQlooClient } from '@/lib/qloo/httpClient';
import { SeedResolver } from '@/lib/qloo/seedResolver';
import { buildFeasibleCandidatePool } from '@/lib/engine/poolSelector';
import { validateCandidatePlan } from '@/lib/engine/validator';
import { planNextActions } from '@/lib/agent/planner';
import { applyReplanAction } from '@/lib/agent/actions';
import { generateFactualExplanation } from '@/lib/agent/explainer';
import { computeFixedPoolPercentileRanksTyped } from '@/lib/engine/ledgerWrapper';
import catalog from '@/data/chicago_catalog.json';
import commuteMatrix from '@/data/chicago_commute_matrix.json';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: any) => {
    try {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {}
  };

  (async () => {
    try {
      const qlooClient = new HttpQlooClient();
      const resolver = new SeedResolver(qlooClient);
      const provenance: any[] = [];

      await sendEvent('state', { stage: 'validating', message: 'Validating squad constraints...' });

      // Step 1: Resolve All Member Seeds in Batch
      await sendEvent('state', { stage: 'resolving_seeds', message: 'Resolving media seeds into Qloo entities...' });
      const memberResolvedSeeds: Record<string, any[]> = {};
      const allResolvedSeeds: any[] = [];
      const needsInputBatch: any[] = [];

      for (const member of body.members) {
        const alias = member.alias || member.memberId;
        memberResolvedSeeds[alias] = [];
        for (const seed of member.seeds) {
          const outcome = await resolver.resolveSeed(seed, provenance);
          if (outcome.status === 'needs_input') {
            needsInputBatch.push({ alias, ...outcome });
          } else if (outcome.status === 'resolved') {
            memberResolvedSeeds[alias].push(outcome.seed);
            allResolvedSeeds.push(outcome.seed);
          } else if (outcome.status === 'cold_start' && outcome.suggestedTags.length > 0) {
            const bridgedSeed = {
              originalText: seed.text,
              qlooTagUrn: outcome.suggestedTags[0].urn,
              entityName: outcome.suggestedTags[0].name,
              entityType: 'urn:tag',
              resolutionKind: 'tag_bridged'
            };
            memberResolvedSeeds[alias].push(bridgedSeed);
            allResolvedSeeds.push(bridgedSeed);
          }
        }
      }

      if (needsInputBatch.length > 0) {
        await sendEvent('needs_input', { ambiguousSeeds: needsInputBatch });
        return;
      }

      // Step 2: Build Feasible Candidate Pool P of size N_pool
      const lowestCap = Math.min(...body.members.map((m: any) => m.capCents));
      let currentPool = buildFeasibleCandidatePool(
        catalog,
        lowestCap,
        body.members.flatMap((m: any) => m.filters || []),
        body.maxOneWayMinutes || 30,
        body.members.map((m: any) => m.origin),
        commuteMatrix
      );

      if (currentPool.length === 0) {
        await sendEvent('terminal', {
          status: 'infeasible',
          message: 'No venues in Chicago catalog meet the initial budget, commute, and hard filter criteria.'
        });
        return;
      }

      // Map catalog venue IDs to Qloo place entity UUIDs for Qloo queries
      const venueIdToQlooId = new Map(catalog.map(v => [v.id, v.qlooEntityId]));
      const qlooIdToVenueId = new Map(catalog.map(v => [v.qlooEntityId, v.id]));
      const poolQlooIds = currentPool.map(id => venueIdToQlooId.get(id)).filter(Boolean) as any[];

      // Step 3: Score Taste with Qloo Insights (1 Joint Call + 1 Per-Member Call + Fix F-01 Fixed-Pool Ranks)
      await sendEvent('state', {
        stage: 'scoring_taste',
        message: 'Querying joint and per-member Qloo place affinities over feasible pool...'
      });

      const pooledEntityIds = allResolvedSeeds.filter(s => s.qlooEntityId).map(s => s.qlooEntityId).slice(0, 10);
      const pooledTagUrns = allResolvedSeeds.filter(s => s.qlooTagUrn).map(s => s.qlooTagUrn).slice(0, 10);

      // 3a. Joint query over the fixed pool
      await qlooClient.getPlaceInsights(pooledEntityIds, pooledTagUrns, poolQlooIds, provenance);

      // 3b. Per-member queries over the exact same fixed pool
      const memberRanks: Record<string, Record<string, number>> = {};

      for (const member of body.members) {
        const alias = member.alias || member.memberId;
        const mSeeds = memberResolvedSeeds[alias] || [];
        const mEntityIds = mSeeds.filter(s => s.qlooEntityId).map(s => s.qlooEntityId);
        const mTagUrns = mSeeds.filter(s => s.qlooTagUrn).map(s => s.qlooTagUrn);

        const mInsights = await qlooClient.getPlaceInsights(mEntityIds, mTagUrns, poolQlooIds, provenance);
        const orderedReturnedVenueIds = mInsights.results
          .map(r => qlooIdToVenueId.get(r.id))
          .filter((vId): vId is string => Boolean(vId && currentPool.includes(vId)));

        // Fix F-01: Fixed-pool denominator N_pool - 1 with tied bottom position (k + 1 + N_pool) / 2
        memberRanks[alias] = computeFixedPoolPercentileRanksTyped(orderedReturnedVenueIds, currentPool);
      }

      // Step 4: Sort Pool by SquadConsensusScore & Execute Bounded Replan Loop (max 3 replans)
      await sendEvent('state', {
        stage: 'checking_constraints',
        message: 'Verifying 13-row integer-cent ledger & Pareto fairness...'
      });

      let replans = 0;
      let finalPlan: any = null;
      let currentMembers = body.members.map((m: any, i: number) => ({
        alias: m.alias || m.memberId || `M${i + 1}`,
        origin: m.origin,
        mode: m.mode || m.commuteMode || 'walk',
        capCents: m.capCents,
        hardFilters: m.filters || []
      }));

      while (replans <= 3) {
        // Evaluate all candidates in currentPool and rank by SquadConsensusScore descending
        const evaluatedCandidates = currentPool
          .map(vId => catalog.find(v => v.id === vId))
          .filter(Boolean)
          .map(candidateVenue => ({
            candidateVenue,
            verdict: validateCandidatePlan({
              members: currentMembers,
              candidateVenue,
              commuteMatrix,
              maxOneWayMinutes: body.maxOneWayMinutes || 30,
              timeWindow: body.window || { day: 'tue', start: '18:00', end: '21:00' },
              memberRanks,
              scenario: body.options?.scenario ?? 'base',
              contingencyBp: body.options?.contingencyBp ?? 1000,
              blindCapMode: body.options?.blindCapMode ?? true
            })
          }))
          .sort((a, b) => b.verdict.fairness.squadConsensusScore - a.verdict.fairness.squadConsensusScore);

        const passing = evaluatedCandidates.find(c => c.verdict.valid);
        if (passing) {
          finalPlan = { primaryVenue: passing.candidateVenue, ...passing.verdict };
          break;
        }

        if (replans === 3 || evaluatedCandidates.length === 0) break;

        const topAttempt = evaluatedCandidates[0];
        replans++;
        await sendEvent('state', {
          stage: 'replanning',
          replanCount: replans,
          violations: topAttempt.verdict.breaches
        });

        const closedIds = evaluatedCandidates
          .filter(c => c.candidateVenue && c.verdict.breaches.some((b: any) => b.type === 'HOURS_CLOSED'))
          .map(c => c.candidateVenue!.id);
        if (closedIds.length > 0 && currentPool.length > closedIds.length) {
          currentPool = currentPool.filter(id => !closedIds.includes(id));
        }

        const actions = await planNextActions(topAttempt.verdict.breaches, currentPool, null);
        for (const action of actions) {
          const applied = applyReplanAction(action, currentPool, catalog, currentMembers);
          currentPool = applied.updatedPool;
          currentMembers = applied.updatedMembers;
        }
      }

      if (!finalPlan) {
        await sendEvent('terminal', {
          status: 'infeasible',
          message: 'No venue satisfied all constraints within 3 replans.'
        });
        return;
      }

      // Step 5: Shared Cultural DNA Card via /v2/insights/compare
      let culturalDna: any = { sharedTags: [], memberDistinctiveTags: {}, compareStatus: 'tag_intersection_fallback' };
      try {
        const compareRes = await qlooClient.compareAudiences(
          pooledEntityIds.slice(0, 2),
          pooledEntityIds.slice(2, 4),
          provenance
        );
        culturalDna = {
          sharedTags: compareRes.data.shared.map(t => ({ urn: t.tag, name: t.name || t.tag, score: t.score })),
          memberDistinctiveTags: compareRes.data.distinctive,
          compareStatus: 'live_qloo'
        };
      } catch {
        // Tag intersection fallback
        const allTagUrns = allResolvedSeeds.filter(s => s.qlooTagUrn).map(s => s.qlooTagUrn);
        culturalDna = {
          sharedTags: allTagUrns.map(urn => ({ urn, name: urn.replace('urn:tag:', '').replace(/_/g, ' '), score: 0.8 })),
          memberDistinctiveTags: {},
          compareStatus: 'tag_intersection_fallback'
        };
      }

      // Step 6: Generate Factual Explanation
      const explanation = await generateFactualExplanation({ ...finalPlan, culturalDna }, null);

      await sendEvent('terminal', {
        status: 'completed',
        plan: finalPlan,
        culturalDna,
        explanation,
        provenance,
        limits: 'Qloo scores are relative to the query, not probabilities or guarantees of enjoyment.'
      });
    } catch (err: any) {
      await sendEvent('terminal', { status: 'failed', error: err.message });
    } finally {
      try {
        await writer.close();
      } catch {}
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
