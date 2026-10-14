import 'server-only';
import { createClient } from '@supabase/supabase-js';

const usdPilotCap = 10;
const usdMonthlyCap = 50;

export type AuthenticatedAdult = { userId: string };

function env(name: string) { return process.env[name]?.trim() || ''; }

export async function authenticateAdultRequest(request: Request): Promise<AuthenticatedAdult> {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!token || !url || !anonKey || !serviceKey) {
    throw new Error('AUTH_REQUIRED');
  }

  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) throw new Error('AUTH_REQUIRED');

  // Do not trust user-editable metadata for age checks. This table must be populated
  // by the application's approved age-verification workflow.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: verification, error: verificationError } = await admin
    .from('adult_access_verifications')
    .select('user_id,status,verified_at')
    .eq('user_id', data.user.id)
    .eq('status', 'verified')
    .not('verified_at', 'is', null)
    .maybeSingle();
  if (verificationError || !verification) throw new Error('AGE_VERIFICATION_REQUIRED');

  return { userId: data.user.id };
}

function assertBudgetConfiguration() {
  const limit = Number(env('SPICYAPI_MONTHLY_SPEND_LIMIT_USD'));
  const pilot = Number(env('SPICYAPI_PILOT_SPEND_LIMIT_USD'));
  if (!Number.isFinite(limit) || limit <= 0 || limit > usdMonthlyCap) throw new Error('SPEND_LIMIT_CONFIGURATION_INVALID');
  if (!Number.isFinite(pilot) || pilot <= 0 || pilot > usdPilotCap || pilot > limit) throw new Error('PILOT_LIMIT_CONFIGURATION_INVALID');
  if (env('SPICYAPI_SPEND_LEDGER_READY') !== 'true') throw new Error('SPEND_LEDGER_NOT_READY');
  if (env('SPICYAPI_LIVE_CALLS_ENABLED') !== 'true' || !env('SPICYAPI_PURCHASE_APPROVAL_ID') || !env('SPICYAPI_API_KEY')) {
    throw new Error('PAID_PROVIDER_DISABLED');
  }
  return { limit, pilot };
}

export async function reserveSpicySpend(userId: string, estimatedUsd: number, feature: 'chat' | 'image' | 'voice' | 'video') {
  const { limit, pilot } = assertBudgetConfiguration();
  if (!Number.isFinite(estimatedUsd) || estimatedUsd <= 0 || estimatedUsd > pilot) throw new Error('REQUEST_EXCEEDS_PILOT_CAP');
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('SPEND_LEDGER_NOT_READY');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.rpc('reserve_spicyapi_usage', {
    p_user_id: userId,
    p_estimated_usd: Number(estimatedUsd.toFixed(6)),
    p_monthly_limit_usd: limit,
    p_pilot_limit_usd: pilot,
    p_feature: feature,
  });
  if (error || !data?.reservation_id) throw new Error('SPEND_LIMIT_REACHED_OR_LEDGER_UNAVAILABLE');
  return String(data.reservation_id);
}

export async function attachSpicyTask(userId: string, reservationId: string, taskId: string) {
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('SPEND_LEDGER_NOT_READY');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.from('spicyapi_usage_ledger')
    .update({ provider_request_id: taskId })
    .eq('id', reservationId).eq('user_id', userId).eq('status', 'reserved');
  if (error) throw new Error('SPEND_LEDGER_SETTLEMENT_FAILED');
}

export async function findSpicyTaskReservation(userId: string, taskId: string) {
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('SPEND_LEDGER_NOT_READY');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.from('spicyapi_usage_ledger')
    .select('id,status').eq('provider_request_id', taskId).eq('user_id', userId).maybeSingle();
  if (error || !data) throw new Error('VIDEO_TASK_NOT_FOUND');
  return { reservationId: String(data.id), status: String(data.status) };
}

export async function settleSpicySpend(reservationId: string, actualUsd: number, outcome: 'settled' | 'failed') {
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('SPEND_LEDGER_NOT_READY');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.rpc('settle_spicyapi_usage', {
    p_reservation_id: reservationId,
    p_actual_usd: outcome === 'settled' ? Number(Math.max(0, actualUsd).toFixed(6)) : 0,
    p_status: outcome,
  });
  if (error) throw new Error('SPEND_LEDGER_SETTLEMENT_FAILED');
}

export function publicSpicyError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'AUTH_REQUIRED') return { status: 401, error: 'Please sign in to use AI media.' };
  if (message.startsWith('CONTENT_POLICY_BLOCK:')) return { status: 422, error: 'This prompt conflicts with Soul’s adult-content policy.' };\n  if (message === 'VIDEO_TASK_NOT_FOUND') return { status: 404, error: 'Video task was not found for this account.' };\n  if (message === 'AGE_VERIFICATION_REQUIRED') return { status: 403, error: 'Verified adult access is required for AI media.' };
  if (message === 'PAID_PROVIDER_DISABLED' || message === 'SPEND_LEDGER_NOT_READY') return { status: 503, error: 'Paid AI generation is not enabled. No paid request was sent.' };
  if (message === 'SPEND_LIMIT_REACHED_OR_LEDGER_UNAVAILABLE' || message === 'REQUEST_EXCEEDS_PILOT_CAP') return { status: 429, error: 'The AI usage budget or pilot limit has been reached.' };
  if (message.includes('LIMIT_CONFIGURATION_INVALID')) return { status: 503, error: 'AI spending limits are not configured safely.' };
  return { status: 503, error: 'AI media is temporarily unavailable.' };
}
