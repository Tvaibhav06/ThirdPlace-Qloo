// tests/seedResolver.test.ts
// Unit tests verifying AC-01.1..AC-01.5 and HR-10 (Seed resolution, disambiguation, tag bridging, privacy).

import test from 'node:test';
import assert from 'node:assert/strict';
import { SeedResolver, SeedInput } from '../lib/qloo/seedResolver';
import { HttpQlooClient, ProviderLogRecord } from '../lib/qloo/httpClient';
import { parseQlooEntityId } from '../lib/qloo/types';

class MockQlooClient extends HttpQlooClient {
  public searchResponses: Record<string, any> = {};
  public tagResponses: Record<string, any> = {};
  public interceptedQueries: string[] = [];

  constructor() {
    super();
  }

  // @ts-ignore
  public override async search(
    query: string,
    typeUrn: any,
    take = 5,
    provenanceLog?: ProviderLogRecord[]
  ): Promise<any> {
    this.interceptedQueries.push(query);
    if (provenanceLog) {
      provenanceLog.push({
        provider: 'qloo',
        method: 'GET',
        path: '/search',
        redactedParams: { query, type: typeUrn },
        status: 200,
        durationMs: 45,
        cached: false,
        correlationId: 'test-req',
        resultCount: this.searchResponses[query]?.results?.length || 0
      });
    }
    const data = this.searchResponses[query] || { results: [] };
    return { data, cached: false };
  }

  // @ts-ignore
  public override async getTags(
    query: string,
    take = 3,
    provenanceLog?: ProviderLogRecord[]
  ): Promise<any> {
    this.interceptedQueries.push(`tag:${query}`);
    const data = this.tagResponses[query] || { results: [] };
    return { data, cached: false };
  }
}

test('AC-01.1: Exact unique match produces resolved status with no ambiguity prompt', async () => {
  const mockClient = new MockQlooClient();
  mockClient.searchResponses['Dune'] = {
    results: [
      {
        id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
        name: 'Dune',
        type: 'urn:entity:book',
        description: 'Frank Herbert 1965'
      }
    ]
  };

  const resolver = new SeedResolver(mockClient);
  const outcome = await resolver.resolveSeed({ text: 'Dune', domain: 'book' });

  assert.equal(outcome.status, 'resolved');
  if (outcome.status === 'resolved') {
    assert.equal(outcome.seed.entityName, 'Dune');
    assert.equal(outcome.seed.qlooEntityId, 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');
    assert.equal(outcome.seed.resolutionKind, 'exact');
  }
});

test('AC-01.2: Ambiguous seed yields needs_input with >= 2 candidates for user disambiguation', async () => {
  const mockClient = new MockQlooClient();
  mockClient.searchResponses['Dune'] = {
    results: [
      {
        id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
        name: 'Dune',
        type: 'urn:entity:book',
        disambiguation: '1965 novel by Frank Herbert'
      },
      {
        id: 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
        name: 'Dune (2021 film)',
        type: 'urn:entity:movie',
        disambiguation: 'Directed by Denis Villeneuve'
      }
    ]
  };

  const resolver = new SeedResolver(mockClient);
  const outcome = await resolver.resolveSeed({ text: 'Dune', domain: 'movie' });

  assert.equal(outcome.status, 'needs_input');
  if (outcome.status === 'needs_input') {
    assert.equal(outcome.candidates.length, 2);
    assert.equal(outcome.candidates[0].name, 'Dune');
    assert.equal(outcome.candidates[1].name, 'Dune (2021 film)');
    assert.ok(outcome.candidates[0].disambiguation);
  }
});

test('AC-01.4 & HR-10: Privacy and Credential Isolation - No member names or aliases leave client toward Qloo', async () => {
  const mockClient = new MockQlooClient();
  mockClient.searchResponses['Radiohead'] = {
    results: [
      {
        id: 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f',
        name: 'Radiohead',
        type: 'urn:entity:artist'
      }
    ]
  };

  const provenanceLog: ProviderLogRecord[] = [];
  const resolver = new SeedResolver(mockClient);

  // Input contains media seed without member identifiers
  const memberSeed: SeedInput = { text: 'Radiohead', domain: 'artist' };
  await resolver.resolveSeed(memberSeed, provenanceLog);

  // Assert query sent to Qloo is solely the media text
  assert.equal(mockClient.interceptedQueries.length, 1);
  assert.equal(mockClient.interceptedQueries[0], 'Radiohead');
  assert.ok(!mockClient.interceptedQueries[0].includes('M1'));
  assert.ok(!mockClient.interceptedQueries[0].includes('Alice'));

  // Provenance log only captures redacted parameters
  assert.equal(provenanceLog.length, 1);
  assert.equal(provenanceLog[0].provider, 'qloo');
  assert.deepEqual(provenanceLog[0].redactedParams, { query: 'Radiohead', type: 'urn:entity:artist' });
});

test('AC-01.5: Unindexed or obscure seed triggers cold-start tag bridging option', async () => {
  const mockClient = new MockQlooClient();
  mockClient.searchResponses['HyperObscureIndieGameXYZ'] = {
    results: []
  };
  mockClient.tagResponses['HyperObscureIndieGameXYZ'] = {
    results: [
      { urn: 'urn:tag:indie_gaming', name: 'Indie Games' },
      { urn: 'urn:tag:cyberpunk', name: 'Cyberpunk' }
    ]
  };

  const resolver = new SeedResolver(mockClient);
  const outcome = await resolver.resolveSeed({
    text: 'HyperObscureIndieGameXYZ',
    domain: 'videogame'
  });

  assert.equal(outcome.status, 'cold_start');
  if (outcome.status === 'cold_start') {
    assert.equal(outcome.query, 'HyperObscureIndieGameXYZ');
    assert.equal(outcome.suggestedTags.length, 2);
    assert.equal(outcome.suggestedTags[0].urn, 'urn:tag:indie_gaming');
  }
});

test('AC-01.3: Branded types reject invalid entity ID format', () => {
  assert.throws(() => {
    parseQlooEntityId('invalid-uuid-string');
  }, /Invalid QlooEntityId format/);

  const valid = parseQlooEntityId('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');
  assert.equal(valid, 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');
});
