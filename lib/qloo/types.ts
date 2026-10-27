// lib/qloo/types.ts
// Branded types and interfaces for the Qloo API integration.
// Prevents fabricated entity IDs and enforces strict domain discipline.

declare const QlooEntityIdBrand: unique symbol;
export type QlooEntityId = string & { readonly [QlooEntityIdBrand]: true };

declare const QlooEntityTypeUrnBrand: unique symbol;
export type QlooEntityTypeUrn = (
  | 'urn:entity:artist'
  | 'urn:entity:book'
  | 'urn:entity:movie'
  | 'urn:entity:tv_show'
  | 'urn:entity:videogame' // Critical: No underscore! urn:entity:video_game returns HTTP 400
  | 'urn:entity:podcast'
  | 'urn:entity:place'
  | 'urn:entity:brand'
  | 'urn:entity:locality'
) & { readonly [QlooEntityTypeUrnBrand]: true };

declare const QlooTagUrnBrand: unique symbol;
export type QlooTagUrn = `urn:tag:${string}` & { readonly [QlooTagUrnBrand]: true };

export function parseQlooEntityId(id: string): QlooEntityId {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid QlooEntityId format: ${id}`);
  }
  return id as QlooEntityId;
}

export function parseQlooEntityTypeUrn(urn: string): QlooEntityTypeUrn {
  const allowed = [
    'urn:entity:artist',
    'urn:entity:book',
    'urn:entity:movie',
    'urn:entity:tv_show',
    'urn:entity:videogame',
    'urn:entity:podcast',
    'urn:entity:place',
    'urn:entity:brand',
    'urn:entity:locality'
  ];
  if (!allowed.includes(urn)) {
    throw new Error(`Unsupported QlooEntityTypeUrn: ${urn}`);
  }
  return urn as QlooEntityTypeUrn;
}

export function parseQlooTagUrn(urn: string): QlooTagUrn {
  if (!urn.startsWith('urn:tag:')) {
    throw new Error(`Invalid QlooTagUrn prefix: ${urn}`);
  }
  return urn as QlooTagUrn;
}

export interface ResolvedSeed {
  originalText: string;
  domain?: string;
  qlooEntityId?: QlooEntityId;
  qlooTagUrn?: QlooTagUrn;
  entityName: string;
  entityType: QlooEntityTypeUrn | 'urn:tag';
  resolutionKind: 'exact' | 'chosen' | 'tag_bridged';
  provenance: {
    query: string;
    resolvedAt: string;
  };
}

export interface SharedCulturalDna {
  sharedTags: Array<{ urn: QlooTagUrn; name: string; score: number }>;
  memberDistinctiveTags: Record<string, Array<{ urn: QlooTagUrn; name: string; score: number }>>;
  compareStatus: 'live_qloo' | 'tag_intersection_fallback' | 'failed';
}
