import { NextRequest, NextResponse } from 'next/server';
import { spicyChat } from '@/lib/spicyapi';
import { assertAdultFictionPrompt } from '@/lib/spicyapi-safety';
import { authenticateAdultRequest, publicSpicyError, reserveSpicySpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let reservationId = '';
  let providerRequestStarted = false;
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
    if (!messages.length || messages.some((m: any) => !['user', 'assistant', 'system'].includes(m?.role) || typeof m?.content !== 'string')) {
      return NextResponse.json({ error: 'Valid chat messages are required.' }, { status: 400 });
    }
    const safeMessages = messages.map((m: any) => ({ role: m.role, content: m.role === 'user' ? assertAdultFictionPrompt(m.content).slice(0, 4000) : m.content.slice(0, 4000) }));
    const estimate = 0.01; // Conservative small pilot reservation; provider preflight and model caps still apply.
    reservationId = await reserveSpicySpend(userId, estimate, 'chat');
    providerRequestStarted = true;
    const result = await spicyChat(safeMessages, 300);
    const cost = Number((result as any)?.cost_usd);
    if (!Number.isFinite(cost)) throw new Error('PROVIDER_COST_MISSING');
    await settleSpicySpend(reservationId, cost, 'settled');
    return NextResponse.json({ reply: result.choices?.[0]?.message?.content || '', usage: result.usage, costUsd: cost });
  } catch (error) {
    if (reservationId && !providerRequestStarted) { try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {} }
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
