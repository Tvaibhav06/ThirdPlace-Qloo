// lib/qloo/cache.ts
// In-memory 24-hour TTL cache with SHA-256 request hashing and daily budget circuit breaker.

import crypto from 'node:crypto';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export class QlooMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private dailyCounter = 0;
  private currentDay = new Date().toISOString().slice(0, 10);
  private readonly dailyBudget: number;

  constructor(dailyBudget = 500) {
    this.dailyBudget = dailyBudget;
  }

  public hashRequest(endpoint: string, params: Record<string, unknown>): string {
    const serialized = JSON.stringify({ endpoint, params }, Object.keys(params).sort());
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public get<T>(hash: string): T | null {
    const entry = this.cache.get(hash);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return null;
    }
    return entry.data as T;
  }

  public set<T>(hash: string, data: T, ttlSeconds = 86400): void {
    this.cache.set(hash, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public canExecuteRequest(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== this.currentDay) {
      this.currentDay = today;
      this.dailyCounter = 0;
    }
    return this.dailyCounter < this.dailyBudget;
  }

  public incrementRequestCount(): void {
    this.dailyCounter++;
  }

  public getStats() {
    return {
      dailyCount: this.dailyCounter,
      dailyBudget: this.dailyBudget,
      activeCachedEntries: this.cache.size
    };
  }
}

export const globalQlooCache = new QlooMemoryCache(
  parseInt(process.env.APP_DAILY_QLOO_BUDGET || '500', 10)
);
