// lib/qloo/seedResolver.ts
// FR-01: Seed resolution with ambiguity handling and cold-start tag bridging.

import { HttpQlooClient, ProviderLogRecord } from './httpClient';
import { ResolvedSeed, QlooEntityTypeUrn, parseQlooEntityId, parseQlooTagUrn } from './types';

export interface SeedInput {
  text: string;
  domain?: 'artist' | 'book' | 'movie' | 'tv_show' | 'videogame' | 'podcast';
}

export type SeedResolutionOutcome =
  | { status: 'resolved'; seed: ResolvedSeed }
  | {
      status: 'needs_input';
      query: string;
      domain?: string;
      candidates: Array<{ id: string; name: string; type: string; disambiguation?: string }>;
    }
  | { status: 'cold_start'; query: string; suggestedTags: Array<{ urn: string; name: string }> };

export class SeedResolver {
  private client: HttpQlooClient;

  constructor(client: HttpQlooClient) {
    this.client = client;
  }

  public async resolveSeed(
    input: SeedInput,
    provenanceLog?: ProviderLogRecord[]
  ): Promise<SeedResolutionOutcome> {
    const cleanText = input.text.trim();
    const typeUrn = `urn:entity:${input.domain || 'movie'}` as QlooEntityTypeUrn;

    const { data } = await this.client.search(cleanText, typeUrn, 5, provenanceLog);

    if (!data.results || data.results.length === 0) {
      // Cold-start tag bridging via /v2/tags
      const tagRes = await this.client.getTags(cleanText, 3, provenanceLog);
      return {
        status: 'cold_start',
        query: cleanText,
        suggestedTags: tagRes.data.results.map(t => ({ urn: t.urn, name: t.name }))
      };
    }

    const exactMatch = data.results.find(
      r => r.name.toLowerCase() === cleanText.toLowerCase()
    );

    if (exactMatch && data.results.length === 1) {
      return {
        status: 'resolved',
        seed: {
          originalText: cleanText,
          domain: input.domain,
          qlooEntityId: parseQlooEntityId(exactMatch.id),
          entityName: exactMatch.name,
          entityType: typeUrn,
          resolutionKind: 'exact',
          provenance: { query: cleanText, resolvedAt: new Date().toISOString() }
        }
      };
    }

    if (data.results.length > 1) {
      return {
        status: 'needs_input',
        query: cleanText,
        domain: input.domain,
        candidates: data.results.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          disambiguation: r.disambiguation || r.description
        }))
      };
    }

    return {
      status: 'resolved',
      seed: {
        originalText: cleanText,
        domain: input.domain,
        qlooEntityId: parseQlooEntityId(data.results[0].id),
        entityName: data.results[0].name,
        entityType: typeUrn,
        resolutionKind: 'exact',
        provenance: { query: cleanText, resolvedAt: new Date().toISOString() }
      }
    };
  }
}
