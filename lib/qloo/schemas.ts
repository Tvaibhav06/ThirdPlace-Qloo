// lib/qloo/schemas.ts
// Strict Zod schemas for Qloo API response parsing with resilient ID transforms.

import { z } from 'zod';

export const QlooSearchItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    entity_id: z.string().uuid().optional(),
    name: z.string(),
    type: z.string().optional().default('urn:entity:place'),
    disambiguation: z.string().optional(),
    description: z.string().optional(),
    popularity: z.number().optional()
  })
  .refine(item => Boolean(item.entity_id || item.id), {
    message: 'Qloo search item must include entity_id or id'
  })
  .transform(item => ({
    ...item,
    id: (item.entity_id ?? item.id)!
  }));

export const QlooSearchResponseSchema = z.object({
  results: z.array(QlooSearchItemSchema).default([])
});

export const QlooTagItemSchema = z
  .object({
    urn: z.string().startsWith('urn:tag:').optional(),
    id: z.string().startsWith('urn:tag:').optional(),
    name: z.string(),
    type: z.string().optional(),
    affinity: z.number().optional()
  })
  .refine(item => Boolean(item.urn || item.id), {
    message: 'Qloo tag item must include urn or id'
  })
  .transform(item => ({
    ...item,
    urn: (item.urn ?? item.id)!
  }));

export const QlooTagResponseSchema = z.object({
  results: z.array(QlooTagItemSchema).default([])
});

export const QlooInsightPlaceItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    entity_id: z.string().uuid().optional(),
    name: z.string(),
    affinity: z.number().optional(),
    popularity: z.number().optional(),
    tags: z.array(z.string()).optional(),
    location: z
      .object({
        address: z.string().optional(),
        lat: z.number().optional(),
        lon: z.number().optional()
      })
      .optional()
  })
  .refine(item => Boolean(item.entity_id || item.id), {
    message: 'Qloo insight item must include entity_id or id'
  })
  .transform(item => ({
    ...item,
    id: (item.entity_id ?? item.id)!
  }));

export const QlooInsightsResponseSchema = z.object({
  results: z.array(QlooInsightPlaceItemSchema).default([])
});

export const QlooCompareTagItemSchema = z.object({
  tag: z.string().startsWith('urn:tag:'),
  name: z.string().optional(),
  score: z.number()
});

export const QlooCompareResponseSchema = z.object({
  shared: z.array(QlooCompareTagItemSchema).default([]),
  distinctive: z.record(z.string(), z.array(QlooCompareTagItemSchema)).default({})
});
