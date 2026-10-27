// lib/engine/poolSelector.ts
// Prefilters catalog venues to build feasible candidate pool P of size N_pool.

export function buildFeasibleCandidatePool(
  catalog: any[],
  lowestMemberCapCents: number,
  hardFilters: string[],
  maxOneWayMinutes: number,
  memberOrigins: string[],
  commuteMatrix: any
): string[] {
  return catalog
    .filter(venue => {
      // 1. Low spend tier screen against binding lowest cap
      if (venue.spend.lowCents > lowestMemberCapCents) return false;

      // 2. Hard filters screen
      for (const f of hardFilters) {
        if (!venue.tags.includes(f)) return false;
      }

      // 3. Commute feasibility screen from all member origins (at least one mode within limit)
      for (const origin of memberOrigins) {
        const walkDur = commuteMatrix.durationsSeconds[`${origin}->${venue.id}->walk`]?.outward ?? 900;
        const bikeDur = commuteMatrix.durationsSeconds[`${origin}->${venue.id}->bike`]?.outward ?? 600;
        const driveDur = commuteMatrix.durationsSeconds[`${origin}->${venue.id}->drive`]?.outward ?? 450;
        const fastestSeconds = Math.min(walkDur, bikeDur, driveDur);
        if (fastestSeconds > maxOneWayMinutes * 60) return false;
      }

      return true;
    })
    .map(v => v.id);
}
