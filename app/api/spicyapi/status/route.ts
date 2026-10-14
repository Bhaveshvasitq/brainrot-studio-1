import { NextResponse } from 'next/server';
import { spicyApiStatus } from '@/lib/spicyapi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = spicyApiStatus();
  return NextResponse.json({
    provider: status.provider,
    configured: status.configured,
    enabled: status.enabled,
    liveCallsEnabled: status.liveCallsEnabled,
    monthlySpendLimitUsd: status.monthlySpendLimitUsd,
    note: status.note,
  });
}
