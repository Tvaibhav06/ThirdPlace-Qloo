import { NextResponse } from 'next/server';
import { DEFAULT_PRESETS } from '@/lib/presets';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ presets: DEFAULT_PRESETS });
}
