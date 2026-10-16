import { NextRequest, NextResponse } from 'next/server';
import { spicyGetVideoTask } from '@/lib/spicyapi';
import { authenticateAdultRequest, findSpicyTaskReservation, publicSpicyError, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await authenticateAdultRequest(req);
    const taskId = req.nextUrl.searchParams.get('taskId') || '';
    const reservation = await findSpicyTaskReservation(userId, taskId);
    const task = await spicyGetVideoTask(taskId);
    const status = String((task as any)?.status || '');
    if (reservation.status === 'reserved' && status === 'succeeded') {
      const cost = Number((task as any)?.cost_usd);
      if (!Number.isFinite(cost)) throw new Error('PROVIDER_COST_MISSING');
      await settleSpicySpend(reservation.reservationId, cost, 'settled');
    } else if (reservation.status === 'reserved' && status === 'failed') {
      await settleSpicySpend(reservation.reservationId, 0, 'failed');
    }
    return NextResponse.json({
      taskId,
      status,
      output: status === 'succeeded' ? (task as any)?.output : undefined,
      error: status === 'failed' ? (task as any)?.error : undefined,
      costUsd: status === 'succeeded' ? (task as any)?.cost_usd : undefined,
    });
  } catch (error) {
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
