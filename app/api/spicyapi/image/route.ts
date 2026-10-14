import { NextRequest, NextResponse } from 'next/server';
import { spicyImage } from '@/lib/spicyapi';
import { authenticateAdultRequest, publicSpicyError, reserveSpicySpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let reservationId = '';
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 4000) {
      return NextResponse.json({ error: 'A prompt of 1–4,000 characters is required.' }, { status: 400 });
    }
    reservationId = await reserveSpicySpend(userId, 0.09, 'image');
    const result = await spicyImage(body.prompt);
    const cost = Number((result as any)?.cost_usd);
    if (!Number.isFinite(cost)) throw new Error('PROVIDER_COST_MISSING');
    await settleSpicySpend(reservationId, cost, 'settled');
    return NextResponse.json({ images: result.data || [], costUsd: cost, requestId: (result as any).id });
  } catch (error) {
    if (reservationId) { try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {} }
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
