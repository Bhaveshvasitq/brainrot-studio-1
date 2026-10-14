import 'server-only';

const API_BASE = 'https://api.spicyapi.com/v1';

export type SpicyChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export class SpicyApiDisabledError extends Error {
  constructor() {
    super('SpicyAPI paid generation is disabled until provider, checkout total, and pilot amount are explicitly approved.');
    this.name = 'SpicyApiDisabledError';
  }
}

export function spicyApiStatus() {
  const keyPresent = Boolean(process.env.SPICYAPI_API_KEY);
  const explicitlyEnabled = process.env.SPICYAPI_LIVE_CALLS_ENABLED === 'true';
  const approvalMarkerPresent = Boolean(process.env.SPICYAPI_PURCHASE_APPROVAL_ID?.trim());
  return {
    provider: 'spicyapi',
    configured: keyPresent,
    enabled: keyPresent && explicitlyEnabled && approvalMarkerPresent,
    liveCallsEnabled: keyPresent && explicitlyEnabled && approvalMarkerPresent,
    monthlySpendLimitUsd: null as number | null,
    note: 'Live calls remain disabled unless separately approved and server configuration is completed.',
  };
}

function assertLiveCallsAllowed() {
  const status = spicyApiStatus();
  if (!status.enabled) throw new SpicyApiDisabledError();
  const limit = Number(process.env.SPICYAPI_MONTHLY_SPEND_LIMIT_USD);
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error('Missing positive SPICYAPI_MONTHLY_SPEND_LIMIT_USD hard limit.');
  }
  if (!process.env.SPICYAPI_API_KEY) throw new SpicyApiDisabledError();
  return { apiKey: process.env.SPICYAPI_API_KEY, limit };
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const { apiKey } = assertLiveCallsAllowed();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, {
    ...init, headers, cache: 'no-store',
    signal: init.signal ?? AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  let data: any;
  try { data = body ? JSON.parse(body) : {}; } catch { data = { message: body.slice(0, 500) }; }
  if (!response.ok) throw new Error(`SpicyAPI request failed (${response.status}): ${String(data?.error?.message || data?.message || 'Provider error').slice(0, 300)}`);
  return data as T;
}

export async function spicyChat(messages: SpicyChatMessage[], maxTokens = 500) {
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('At least one chat message is required.');
  return request<{ choices?: Array<{ message?: { content?: string } }>; usage?: unknown }>('/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: process.env.SPICYAPI_CHAT_MODEL || 'spicy-companion-1-flash',
      messages, temperature: 0.8, max_tokens: Math.min(700, Math.max(1, Math.floor(maxTokens))), n: 1,
    }),
  });
}

export async function spicyImage(prompt: string) {
  if (!prompt.trim()) throw new Error('An image prompt is required.');
  return request<{ data?: Array<{ url?: string }> }>('/images/generations', {
    method: 'POST',
    body: JSON.stringify({ model: process.env.SPICYAPI_IMAGE_MODEL || 'spicy-image-1', prompt: prompt.trim().slice(0, 3000), n: 1, size: '1024*1024' }),
  });
}

export async function spicySpeech(input: string) {
  if (!input.trim()) throw new Error('Speech text is required.');
  return request<Record<string, unknown>>('/audio/speech', {
    method: 'POST',
    body: JSON.stringify({ model: process.env.SPICYAPI_VOICE_MODEL || 'spicy-voice-2', input: input.trim().slice(0, 4000), voice: process.env.SPICYAPI_VOICE_ID || 'Eva', response_format: 'mp3' }),
  });
}

export async function spicyCreateVideo(prompt: string, durationSeconds = 3) {
  if (!prompt.trim()) throw new Error('A video prompt is required.');
  const duration = Math.min(5, Math.max(3, Math.floor(durationSeconds)));
  return request<Record<string, unknown>>('/videos/generations', {
    method: 'POST',
    body: JSON.stringify({ model: process.env.SPICYAPI_VIDEO_MODEL || 'spicy-motion-3', prompt: prompt.trim().slice(0, 3000), duration, resolution: '480P' }),
  });

export async function spicyGetVideoTask(taskId: string) {
  if (!/^task_[a-zA-Z0-9_-]{4,100}$/.test(taskId)) throw new Error('Invalid video task id.');
  return request<Record<string, unknown>>(`/videos/tasks/${encodeURIComponent(taskId)}`, { method: 'GET' });
}
