// app/api/health/route.ts
// Health probe for Render Starter uptime monitoring and GitHub Actions hourly probe.

import { NextResponse } from 'next/server';
import { globalQlooCache } from '@/lib/qloo/cache';

const START_TIME = Date.now();

export const runtime = 'nodejs';

export async function GET() {
  const uptimeSeconds = Math.round((Date.now() - START_TIME) / 1000);
  const cacheStats = globalQlooCache.getStats();

  return NextResponse.json({
    status: 'ok',
    uptimeSeconds,
    service: 'ThirdPlace Squad (2026 Qloo Agentic Hackathon)',
    qlooHost: process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com',
    qlooConfigured: Boolean(process.env.QLOO_API_KEY),
    ticketmasterConfigured: Boolean(process.env.TICKETMASTER_API_KEY),
    dailyBudgetStats: cacheStats,
    timestamp: new Date().toISOString()
  });
}
