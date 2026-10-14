import { NextRequest, NextResponse } from 'next/server';
import { spicyCreateVideo } from '@/lib/spicyapi';
import { authenticateAdultRequest, publicSpicyError, reserveSpicySpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let reservationId = '';
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 3000) {
      return NextResponse.json({ error: 'A prompt of 1–3,000 characters is required.' }, { status: 400 });
    }
    const duration = Math.min(5, Math.max(3, Math.floor(Number(body?.durationSeconds) || 3)));
    reservationId = await reserveSpicySpend(userId, duration * 0.10);
    const result = await spicyCreateVideo(body.prompt, duration);
    // Creation returns an async task; reserve the full estimated output price and settle only
    // after a task poll confirms the provider's final cost. Do not report this as settled yet.
    return NextResponse.json({ task: result, reservationId, estimatedCostUsd: duration * 0.10, status: 'processing' }, { status: 202 });
  } catch (error) {
    if (reservationId) { try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {} }
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
