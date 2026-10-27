// lib/agent/actions.ts
// The 6 allowlisted agent replan actions. Hard constraints and member caps are never mutated.

export type ReplanActionType =
  | 'SWITCH_TO_CHEAPER_VENUE'
  | 'BUILD_TWO_STOP_COMBO'
  | 'SHIFT_NEIGHBORHOOD_CENTER'
  | 'SWAP_COMMUTE_MODE'
  | 'WIDEN_POOL'
  | 'RELAX_SOFT_TAG';

export interface ReplanAction {
  type: ReplanActionType;
  parameters: Record<string, any>;
  rationale: string;
}

export function applyReplanAction(
  action: ReplanAction,
  currentPool: string[],
  catalog: any[],
  memberInputs: any[]
): { updatedPool: string[]; updatedMembers: any[] } {
  let updatedPool = [...currentPool];
  let updatedMembers = [...memberInputs];

  switch (action.type) {
    case 'SWITCH_TO_CHEAPER_VENUE': {
      // Re-order and filter pool to venues with base spend <= maxBaseCents (default 1200)
      const maxBase = action.parameters?.maxBaseCents ?? 1200;
      const filtered = updatedPool.filter(id => {
        const v = catalog.find(item => item.id === id);
        return v && v.spend.baseCents <= maxBase;
      });
      if (filtered.length > 0) updatedPool = filtered;
      break;
    }

    case 'BUILD_TWO_STOP_COMBO': {
      // Retain $0 cultural anchors (books, records, parks) to pair with low-cost cafes
      const filtered = updatedPool.filter(id => {
        const v = catalog.find(item => item.id === id);
        return v && (v.spend.lowCents === 0 || v.spend.baseCents <= 1200);
      });
      if (filtered.length > 0) updatedPool = filtered;
      break;
    }

    case 'SHIFT_NEIGHBORHOOD_CENTER': {
      // Restrict pool to specified target neighborhood
      const targetNeighborhood = action.parameters.targetNeighborhood;
      if (targetNeighborhood) {
        const filtered = updatedPool.filter(id => {
          const v = catalog.find(item => item.id === id);
          return v && v.neighborhood === targetNeighborhood;
        });
        if (filtered.length > 0) updatedPool = filtered;
      }
      break;
    }

    case 'SWAP_COMMUTE_MODE': {
      // Swap designated member commute mode (e.g. drive to bike/rail)
      const { memberId, alias, newMode } = action.parameters;
      const targetAlias = alias || memberId;
      updatedMembers = updatedMembers.map(m =>
        (m.alias === targetAlias || m.memberId === targetAlias) ? { ...m, mode: newMode } : m
      );
      break;
    }

    case 'WIDEN_POOL': {
      // Expand pool to include all catalog venues matching hard filters
      updatedPool = catalog.map(v => v.id);
      break;
    }

    case 'RELAX_SOFT_TAG': {
      // Remove soft vibe tag (never hard dietary or accessibility filter)
      const tagToDrop = action.parameters.tag;
      updatedMembers = updatedMembers.map(m => ({
        ...m,
        vibes: (m.vibes || []).filter((t: string) => t !== tagToDrop)
      }));
      break;
    }
  }

  return { updatedPool, updatedMembers };
}
