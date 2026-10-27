// app/api/solo/plan/route.ts
// Solo Weekly Third-Place Routine planning route with LI-12 and LI-13 BLS benchmark calculations.

import { NextRequest, NextResponse } from 'next/server';
import { HttpQlooClient } from '@/lib/qloo/httpClient';
import { SeedResolver } from '@/lib/qloo/seedResolver';
import { optimizeSoloWeeklyRoutine } from '@/lib/engine/soloScheduler';
import { computeFixedPoolPercentileRanksTyped } from '@/lib/engine/ledgerWrapper';
import catalog from '@/data/chicago_catalog.json';
import commuteMatrix from '@/data/chicago_commute_matrix.json';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const qlooClient = new HttpQlooClient();
    const resolver = new SeedResolver(qlooClient);
    const provenance: any[] = [];

    // Step 1: Resolve Seeds
    const resolvedSeeds: any[] = [];
    for (const seed of body.seeds || []) {
      const outcome = await resolver.resolveSeed(seed, provenance);
      if (outcome.status === 'resolved') {
        resolvedSeeds.push(outcome.seed);
      }
    }

    // Step 2: Pool & Ranks via Qloo Insights
    const poolVenueIds = catalog.map(v => v.id);
    const poolQlooIds = catalog.map(v => v.qlooEntityId);
    const seedIds = resolvedSeeds.filter(s => s.qlooEntityId).map(s => s.qlooEntityId);
    const seedTags = resolvedSeeds.filter(s => s.qlooTagUrn).map(s => s.qlooTagUrn);

    const qlooIdToVenueId = new Map(catalog.map(v => [v.qlooEntityId, v.id]));
    const insights = await qlooClient.getPlaceInsights(seedIds, seedTags, poolQlooIds as any, provenance);

    const orderedReturnedVenueIds = insights.results
      .map(r => qlooIdToVenueId.get(r.id))
      .filter((vId): vId is string => Boolean(vId && poolVenueIds.includes(vId)));

    const venueRanks = computeFixedPoolPercentileRanksTyped(orderedReturnedVenueIds, poolVenueIds);

    // Step 3: Optimize 3-slot weekly routine
    const routine = optimizeSoloWeeklyRoutine(
      body.slots || [
        { day: 'tue', start: '18:00', end: '20:00' },
        { day: 'thu', start: '18:30', end: '21:00' },
        { day: 'sat', start: '14:00', end: '17:00' }
      ],
      catalog,
      venueRanks,
      body.weeklyCapCents || 3500,
      body.origin || 'logan_square',
      commuteMatrix,
      body.maxOneWayMinutes || 30,
      body.preferredMode || 'bike'
    );

    return NextResponse.json({
      status: 'completed',
      routine,
      provenance,
      limits: 'Qloo scores are relative to the query, not probabilities or guarantees of enjoyment.'
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'failed', error: err.message }, { status: 500 });
  }
}
