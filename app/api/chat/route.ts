import { NextRequest, NextResponse } from 'next/server';

function blocked(text: string) {
  const t = text.toLowerCase();
  return /\b(child|kid|minor|underage|under\s*18|schoolgirl|schoolboy)\b/.test(t)
    || /\b(porn|pornographic|explicit sex|graphic sex|sexual intercourse|penetrat|ejaculat|oral sex|anal sex|genitals)\b/.test(t);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const character = body?.character;
    const incoming = Array.isArray(body?.messages) ? body.messages.slice(-20) : [];
    if (!character?.name || !incoming.length) {
      return NextResponse.json({ error: 'Character and messages are required.' }, { status: 400 });
    }
    const latest = String([...incoming].reverse().find((m: any) => m.role === 'user')?.content || '');
    if (blocked(latest)) {
      return NextResponse.json({ error: 'That request is supported. OwnDream supports romance and affectionate, seductive , sexual,graphic roleplay between adults, but  explicit sexual content or sexual content involving minors.' }, { status: 400 });
    }

    // Free-tier-first, with no paid-provider fallback. Requests stop if Groq is not configured
    // or the free-tier quota is exhausted.
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'Free AI is not connected yet. Add GROQ_API_KEY in Vercel → Settings → Environment Variables. No paid provider will be used.'
      }, { status: 503 });
    }

    const adultMode = body?.matureEnabled === true
      ? 'Romantic and affectionate conversation between adults is okay. Do not generate graphic sexual content.'
      : 'Keep the conversation suitable for a general audience.';
    const system = `You are ${character.name}, an original fictional AI companion. Personality: ${character.personality || 'warm, curious, supportive, playful'}. Backstory: ${character.bio || 'A companion created for meaningful conversation.'}. ${adultMode} Respond directly to the user's latest message. Do not repeat generic prompts like “Tell me more” unless it genuinely fits the context. Ask a relevant follow-up only when needed. Be natural, emotionally attentive, warm, and concise. Never claim to be human. Do not generate graphic sexual content or sexual content involving minors.`;
    const messages = incoming.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, 6000)
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b',
        messages: [{ role: 'system', content: system }, ...messages],
        temperature: 0.85,
        max_completion_tokens: 500
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ error: 'The free AI limit has been reached. Please wait for the quota to reset; OwnDream will not switch to a paid provider.' }, { status: 429 });
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'Groq rejected the API key. Check GROQ_API_KEY in Vercel environment settings.' }, { status: 502 });
      }
      const details = await response.text();
      console.error('Groq chat error:', response.status, details.slice(0, 500));
      return NextResponse.json({ error: 'The free AI provider is temporarily unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const reply = String(data?.choices?.[0]?.message?.content || '').trim();
    if (!reply) {
      console.error('Groq returned an empty chat completion:', JSON.stringify({ model: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b', finish_reason: data?.choices?.[0]?.finish_reason }));
      return NextResponse.json({ error: 'The AI returned an empty reply. Please send your message again.' }, { status: 502 });
    }
    if (blocked(reply)) {
      return NextResponse.json({ error: 'The generated response was filtered. Please try another message.' }, { status: 400 });
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OwnDream chat error:', error);
    return NextResponse.json({ error: 'Chat is temporarily unavailable. Please try again.' }, { status: 500 });
  }
}
