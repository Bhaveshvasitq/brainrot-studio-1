import { NextRequest, NextResponse } from 'next/server';
import { assertAdultFictionPrompt } from '@/lib/spicyapi-safety';
import { authenticateAdultRequest, publicSpicyError, reserveWiroSpend, settleSpicySpend } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EXPLICIT_OR_HARMFUL = /\b(porn(?:ography)?|explicit sex|sexual intercourse|penetration|masturbat(?:e|ion)|rape|sexual assault|non[- ]consensual|revenge porn|bestiality|genitals|minor|underage|child|teenager|schoolgirl|schoolboy|loli|shota)\b/i;

function env(name: string) { return process.env[name]?.trim() || ''; }

export async function POST(req: NextRequest) {
  let reservationId = '';
  let providerRequestStarted = false;
  try {
    const { userId } = await authenticateAdultRequest(req);
    const body = await req.json();
    if (typeof body?.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 4000) {
      return NextResponse.json({ error: 'A prompt of 1–4,000 characters is required.' }, { status: 400 });
    }
    const safePrompt = assertAdultFictionPrompt(body.prompt);
    if (EXPLICIT_OR_HARMFUL.test(safePrompt)) {
      return NextResponse.json({ error: 'Use fictional adult characters and non-graphic, consensual romantic or glamour concepts.' }, { status: 422 });
    }

    const model = env('WIRO_IMAGE_MODEL');
    const match = model.match(/^([a-z0-9-]+)\/([a-z0-9-]+)$/i);
    const apiKey = env('WIRO_API_KEY');
    if (!match || !apiKey) {
      return NextResponse.json({ error: 'Wiro is not configured yet. Add WIRO_API_KEY and WIRO_IMAGE_MODEL in Vercel.' }, { status: 503 });
    }
    const estimatedUsd = Number(env('WIRO_IMAGE_ESTIMATED_COST_USD') || '0.10');
    reservationId = await reserveWiroSpend(userId, estimatedUsd);

    const prompt = 'Original fictional adult characters, clearly age 18 or older, consensual and non-graphic. ' + safePrompt;
    providerRequestStarted = true;
    const response = await fetch(`https://api.wiro.ai/v1/Run/${match[1]}/${match[2]}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        prompt,
        negativePrompt: 'minors, youth-coded features, non-consensual content, sexual violence, explicit sexual activity, identifiable real people, low quality, watermark',
        width: 1024,
        height: 1024,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(55000),
    });

    const payload = await response.json().catch(() => null) as any;
    if (!response.ok || !payload?.result) {
      await settleSpicySpend(reservationId, 0, 'failed');
      reservationId = '';
      const detail = Array.isArray(payload?.errors) ? payload.errors.map((e: any) => String(e?.message || e)).join('; ') : '';
      return NextResponse.json({ error: detail.slice(0, 300) || 'Wiro could not generate this image. Check model access and provider moderation.' }, { status: response.status === 429 ? 429 : 502 });
    }

    const data = payload.data || {};
    const task = data.tasklist?.[0] || data.task || data;
    const output = task.outputs?.find((item: any) => typeof item?.url === 'string')?.url
      || data.outputs?.find((item: any) => typeof item?.url === 'string')?.url;
    const cost = Number(task.totalcost ?? data.totalcost);
    if (task.pexit && String(task.pexit) !== '0') {
      await settleSpicySpend(reservationId, 0, 'failed');
      reservationId = '';
      return NextResponse.json({ error: 'Wiro reported that image generation failed. Try a different prompt.' }, { status: 422 });
    }
    if (!output || !Number.isFinite(cost) || cost < 0) {
      return NextResponse.json({ error: 'Wiro returned an incomplete result. The reserved budget remains protected; contact support before retrying.' }, { status: 502 });
    }
    await settleSpicySpend(reservationId, cost, 'settled');
    reservationId = '';
    return NextResponse.json({ imageUrl: output, costUsd: cost, model });
  } catch (error) {
    if (reservationId && !providerRequestStarted) {
      try { await settleSpicySpend(reservationId, 0, 'failed'); } catch {}
    }
    const mapped = publicSpicyError(error);
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('WIRO_')) {
      if (message === 'WIRO_PAID_PROVIDER_DISABLED') return NextResponse.json({ error: 'Wiro generation is paused until live calls, purchase approval, and spend-ledger controls are explicitly configured.' }, { status: 503 });
      if (message.includes('SPEND_LIMIT_CONFIGURATION_INVALID') || message.includes('PILOT_LIMIT_CONFIGURATION_INVALID') || message.includes('SPEND_LEDGER_NOT_READY')) return NextResponse.json({ error: 'Wiro spending controls are not configured safely.' }, { status: 503 });
      if (message === 'WIRO_REQUEST_EXCEEDS_PILOT_CAP') return NextResponse.json({ error: 'This image request exceeds the configured pilot spending cap.' }, { status: 429 });
    }
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
