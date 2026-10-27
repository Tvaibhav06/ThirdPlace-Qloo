// lib/qloo/httpClient.ts
// Typed HTTP client for Qloo REST API with 24h cache, bounded retries, and chunked queries.

import { QlooEntityId, QlooEntityTypeUrn, QlooTagUrn } from './types';
import {
  QlooSearchResponseSchema,
  QlooInsightsResponseSchema,
  QlooTagResponseSchema,
  QlooCompareResponseSchema
} from './schemas';
import { globalQlooCache } from './cache';

export interface ProviderLogRecord {
  provider: 'qloo' | 'ticketmaster' | 'osrm';
  method: string;
  path: string;
  redactedParams: Record<string, unknown>;
  status: number;
  durationMs: number;
  cached: boolean;
  correlationId: string;
  resultCount: number;
}

export class HttpQlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = (process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
    this.apiKey = process.env.QLOO_API_KEY || '';
  }

  private async executeFetch<T>(
    endpoint: string,
    params: Record<string, string>,
    schema: { parse: (d: unknown) => T },
    provenanceLog?: ProviderLogRecord[]
  ): Promise<{ data: T; cached: boolean }> {
    const hash = globalQlooCache.hashRequest(endpoint, params);
    const cached = globalQlooCache.get<T>(hash);
    if (cached) {
      if (provenanceLog) {
        provenanceLog.push({
          provider: 'qloo',
          method: 'GET',
          path: endpoint,
          redactedParams: params,
          status: 200,
          durationMs: 0,
          cached: true,
          correlationId: `c_${hash.slice(0, 8)}`,
          resultCount: Array.isArray((cached as any).results) ? (cached as any).results.length : 1
        });
      }
      return { data: cached, cached: true };
    }

    if (!globalQlooCache.canExecuteRequest()) {
      throw new Error('APP_DAILY_QLOO_BUDGET_EXCEEDED');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const startTime = Date.now();
    let status = 0;
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < 2) {
      attempts++;
      try {
        globalQlooCache.incrementRequestCount();
        const res = await fetch(url.toString(), {
          headers: {
            'X-Api-Key': this.apiKey,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(8000) // 8s timeout
        });
        status = res.status;

        if (status === 401 || status === 403) {
          throw new Error('QLOO_AUTH_FAILURE');
        }

        if (res.ok) {
          const raw = await res.json();
          const parsed = schema.parse(raw);
          globalQlooCache.set(hash, parsed);
          const durationMs = Date.now() - startTime;

          if (provenanceLog) {
            provenanceLog.push({
              provider: 'qloo',
              method: 'GET',
              path: endpoint,
              redactedParams: params,
              status: 200,
              durationMs,
              cached: false,
              correlationId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              resultCount: Array.isArray((parsed as any).results) ? (parsed as any).results.length : 1
            });
          }
          return { data: parsed, cached: false };
        }

        if (status === 429 || status >= 500) {
          // Bounded jittered backoff <= 1000ms
          await new Promise(r => setTimeout(r, Math.min(1000, 300 * attempts + Math.random() * 200)));
          continue;
        }

        throw new Error(`QLOO_HTTP_${status}`);
      } catch (err: any) {
        lastError = err;
        if (err.message === 'QLOO_AUTH_FAILURE') throw err;
      }
    }

    throw lastError || new Error(`Failed call to ${endpoint}`);
  }

  public async search(
    query: string,
    typeUrn: QlooEntityTypeUrn,
    take = 5,
    provenanceLog?: ProviderLogRecord[]
  ) {
    return this.executeFetch(
      '/search',
      { query, types: typeUrn, take: take.toString() },
      QlooSearchResponseSchema,
      provenanceLog
    );
  }

  public async getTags(
    query: string,
    take = 5,
    provenanceLog?: ProviderLogRecord[]
  ) {
    return this.executeFetch(
      '/v2/tags',
      { 'filter.query': query, take: take.toString() },
      QlooTagResponseSchema,
      provenanceLog
    );
  }

  // FR-02 Step 2: Top-50 Chicago discovery pass + max 10-ID chunked restriction for missing catalog IDs
  public async getPlaceInsights(
    seedEntityIds: QlooEntityId[],
    seedTagUrns: QlooTagUrn[],
    candidateVenueIds: QlooEntityId[],
    provenanceLog?: ProviderLogRecord[]
  ) {
    const baseParams: Record<string, string> = {
      'filter.type': 'urn:entity:place',
      'filter.location.query': 'Chicago',
      'take': '50'
    };
    if (seedEntityIds.length > 0) {
      baseParams['signal.interests.entities'] = seedEntityIds.slice(0, 10).join(',');
    }
    if (seedTagUrns.length > 0) {
      baseParams['signal.interests.tags'] = seedTagUrns.slice(0, 10).join(',');
    }

    // Pass 1: Broad Chicago discovery (take=50) intersected with feasible catalog pool
    const candidateSet = new Set<string>(candidateVenueIds);
    const byId = new Map<string, any>();

    const discovery = await this.executeFetch(
      '/v2/insights',
      baseParams,
      QlooInsightsResponseSchema,
      provenanceLog
    );
    for (const item of discovery.data.results) {
      if (candidateSet.has(item.id)) {
        byId.set(item.id, item);
      }
    }

    // Pass 2: Batch only missing catalog venue IDs in chunks of at most 10 via filter.results.entities
    const missingIds = candidateVenueIds.filter(id => !byId.has(id));
    const chunkSize = 10;
    for (let i = 0; i < missingIds.length; i += chunkSize) {
      const chunk = missingIds.slice(i, i + chunkSize);
      const restrictedParams: Record<string, string> = {
        ...baseParams,
        'filter.results.entities': chunk.join(','),
        'take': chunk.length.toString()
      };
      const { data } = await this.executeFetch(
        '/v2/insights',
        restrictedParams,
        QlooInsightsResponseSchema,
        provenanceLog
      );
      for (const item of data.results) {
        if (candidateSet.has(item.id) && !byId.has(item.id)) {
          byId.set(item.id, item);
        }
      }
    }

    // Sort all matched pool venues by descending Qloo affinity within this query
    const orderedResults = Array.from(byId.values()).sort(
      (a, b) => (b.affinity ?? 0) - (a.affinity ?? 0)
    );

    return { results: orderedResults };
  }

  public async compareAudiences(
    groupAEntities: QlooEntityId[],
    groupBEntities: QlooEntityId[],
    provenanceLog?: ProviderLogRecord[]
  ) {
    const params: Record<string, string> = {
      'signal.interests.entities': groupAEntities.slice(0, 5).join(','),
      'compare.interests.entities': groupBEntities.slice(0, 5).join(',')
    };

    return this.executeFetch(
      '/v2/insights/compare',
      params,
      QlooCompareResponseSchema,
      provenanceLog
    );
  }
}
