// tests/qlooClient.test.ts
// Unit tests for Qloo branded types, Zod schemas, cache, and HTTP client transforms.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseQlooEntityId,
  parseQlooEntityTypeUrn,
  parseQlooTagUrn
} from '../lib/qloo/types';
import {
  QlooSearchItemSchema,
  QlooTagItemSchema,
  QlooInsightPlaceItemSchema
} from '../lib/qloo/schemas';
import { QlooMemoryCache } from '../lib/qloo/cache';

test('Branded Types Validation', () => {
  // Valid UUID
  const validUuid = '12345678-1234-1234-1234-123456789abc';
  assert.equal(parseQlooEntityId(validUuid), validUuid);

  // Invalid UUID throws
  assert.throws(() => parseQlooEntityId('invalid-uuid'));

  // Valid entity types (videogame with no underscore)
  assert.equal(parseQlooEntityTypeUrn('urn:entity:videogame'), 'urn:entity:videogame');
  assert.equal(parseQlooEntityTypeUrn('urn:entity:book'), 'urn:entity:book');
  assert.throws(() => parseQlooEntityTypeUrn('urn:entity:video_game'));

  // Valid tag URN
  assert.equal(parseQlooTagUrn('urn:tag:quiet'), 'urn:tag:quiet');
  assert.throws(() => parseQlooTagUrn('not_a_tag_urn'));
});

test('Zod Schemas resilient transforms (AC-01.3)', () => {
  // Search item with entity_id transforms to id
  const transformedSearch = QlooSearchItemSchema.parse({
    entity_id: '12345678-1234-1234-1234-123456789abc',
    name: 'Dune'
  });
  assert.equal(transformedSearch.id, '12345678-1234-1234-1234-123456789abc');
  assert.equal(transformedSearch.type, 'urn:entity:place');

  // Tag item with id transforms to urn
  const transformedTag = QlooTagItemSchema.parse({
    id: 'urn:tag:indie',
    name: 'Indie'
  });
  assert.equal(transformedTag.urn, 'urn:tag:indie');

  // Insight item with entity_id transforms to id
  const transformedInsight = QlooInsightPlaceItemSchema.parse({
    entity_id: '12345678-1234-1234-1234-123456789abc',
    name: 'Wormhole Coffee',
    affinity: 0.94
  });
  assert.equal(transformedInsight.id, '12345678-1234-1234-1234-123456789abc');
  assert.equal(transformedInsight.affinity, 0.94);
});

test('Cache hashing and TTL circuit breaker (AC-02.4)', () => {
  const cache = new QlooMemoryCache(10);
  const hash1 = cache.hashRequest('/search', { query: 'Dune', type: 'book' });
  const hash2 = cache.hashRequest('/search', { type: 'book', query: 'Dune' });

  // Key sorting guarantees identical hash
  assert.equal(hash1, hash2);

  cache.set(hash1, { test: 123 }, 1); // 1s TTL
  assert.deepEqual(cache.get(hash1), { test: 123 });

  // Increment counter and verify budget
  for (let i = 0; i < 9; i++) {
    cache.incrementRequestCount();
  }
  assert.equal(cache.canExecuteRequest(), true);
  cache.incrementRequestCount();
  assert.equal(cache.canExecuteRequest(), false);
});
