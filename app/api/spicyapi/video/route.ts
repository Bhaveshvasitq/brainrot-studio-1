import { NextRequest, NextResponse } from 'next/server';
import { spicyCreateVideo } from '@/lib/spicyapi';
import { assertAdultFictionPrompt } from '@/lib/spicyapi-safety';
import { attachSpicyTask, authenticateAdultRequest, publicSpicyError, reserveSpicySpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let reservationId = '';
  let providerRequestStarted = false;
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 3000) {
      return NextResponse.json({ error: 'A prompt of 1–3,000 characters is required.' }, { status: 400 });
    }
    const prompt = 'Depict only fictional adult characters aged 18 or older, all consenting. No identifiable real people or youth-coded characters. Scene: ' + assertAdultFictionPrompt(body.prompt);
    const duration = Math.min(5, Math.max(3, Math.floor(Number(body?.durationSeconds) || 3)));
    const estimatedCost = duration * 0.10;
    reservationId = await reserveSpicySpend(userId, estimatedCost, 'video');
    providerRequestStarted = true;
    const task = await spicyCreateVideo(prompt, duration);
    const taskId = String((task as any)?.id || '');
    if (!/^task_[a-zA-Z0-9_-]{4,100}$/.test(taskId)) throw new Error('PROVIDER_TASK_ID_MISSING');
    await attachSpicyTask(userId, reservationId, taskId);
    // Usage remains reserved until the provider task reaches a terminal state and
    // its settled cost/refund is confirmed by the task-poll endpoint.
    return NextResponse.json({ taskId, status: (task as any)?.status || 'queued', estimatedCostUsd: estimatedCost }, { status: 202 });
  } catch (error) {
    if (reservationId && !providerRequestStarted) { try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {} }
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
