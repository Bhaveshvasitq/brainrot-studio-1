import { NextRequest, NextResponse } from 'next/server';
import { spicySpeech } from '@/lib/spicyapi';
import { assertAdultFictionPrompt } from '@/lib/spicyapi-safety';
import { authenticateAdultRequest, publicSpicyError, reserveSpicySpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let reservationId = '';
  let providerResponded = false;
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    if (typeof body?.text !== 'string' || !body.text.trim() || body.text.length > 4000) {
      return NextResponse.json({ error: 'Text of 1–4,000 characters is required.' }, { status: 400 });
    }
    const text = assertAdultFictionPrompt(body.text);
    reservationId = await reserveSpicySpend(userId, 0.20, 'voice');
    const result = await spicySpeech(text);
    providerResponded = true;
    const cost = Number((result as any)?.cost_usd);
    if (!Number.isFinite(cost)) throw new Error('PROVIDER_COST_MISSING');
    await settleSpicySpend(reservationId, cost, 'settled');
    return NextResponse.json({ audio: result, costUsd: cost });
  } catch (error) {
    if (reservationId && !providerResponded) { try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {} }
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
