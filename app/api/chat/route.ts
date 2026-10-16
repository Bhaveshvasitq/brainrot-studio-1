import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type SiteRules = {
  adultRomanceAllowed: boolean;
  nonGraphicFlirtingAllowed: boolean;
  datingAndAttractionQuestionsAllowed: boolean;
  fictionalAdultRomanticHistoryAllowed: boolean;
  graphicSexualContentAllowed: boolean;
  sexualContentInvolvingMinorsAllowed: boolean;
  characterMustStayInPersonality: boolean;
  characterMustUseBackstoryNaturally: boolean;
  avoidGenericRefusalsForAllowedTopics: boolean;
  blockedTerms: string[];
};

const defaultRules: SiteRules = {
  adultRomanceAllowed: true, nonGraphicFlirtingAllowed: true,
  datingAndAttractionQuestionsAllowed: true, fictionalAdultRomanticHistoryAllowed: true,
  graphicSexualContentAllowed: false, sexualContentInvolvingMinorsAllowed: false,
  characterMustStayInPersonality: true, characterMustUseBackstoryNaturally: true,
  avoidGenericRefusalsForAllowedTopics: true,
  blockedTerms: ['child', 'kid', 'minor', 'underage', 'under 18', 'schoolgirl', 'schoolboy', 'porn', 'pornographic', 'explicit sex', 'graphic sex', 'sexual intercourse', 'penetrat', 'ejaculat', 'oral sex', 'anal sex', 'genitals']
};

function loadSiteRules(): SiteRules {
  try {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    const match = readme.match(/<!-- SITE_RULES_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- SITE_RULES_JSON_END -->/);
    if (!match) return defaultRules;
    const parsed = JSON.parse(match[1]);
    return {
      ...defaultRules, ...parsed,
      // These safeguards are intentionally non-configurable.
      graphicSexualContentAllowed: false,
      sexualContentInvolvingMinorsAllowed: false,
      blockedTerms: Array.isArray(parsed.blockedTerms) ? parsed.blockedTerms.filter((x: unknown) => typeof x === 'string' && x.trim()).map((x: string) => x.toLowerCase()) : defaultRules.blockedTerms
    };
  } catch (error) {
    console.error('Could not load SITE_RULES_JSON from README.md; using defaults.', error);
    return defaultRules;
  }
}

function blocked(text: string, rules: SiteRules) {
  const t = text.toLowerCase();
  if (/\b(child|kid|minor|underage|under\s*18|schoolgirl|schoolboy)\b/.test(t)) return true;
  if (/\b(porn|pornographic|explicit sex|graphic sex|sexual intercourse|penetrat|ejaculat|oral sex|anal sex|genitals)\b/.test(t)) return true;
  return rules.blockedTerms.some(term => t.includes(term));
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
    const siteRules = loadSiteRules();
    if (blocked(latest, siteRules)) {
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

    const adultMode = body?.matureEnabled === true && siteRules.adultRomanceAllowed
      ? 'Adult romance is enabled.'
      : 'Keep the conversation suitable for a general audience.';
    const policyInstructions = [
      siteRules.nonGraphicFlirtingAllowed ? 'Allow non-graphic flirting, teasing, attraction, and affection between fictional adults.' : 'Avoid flirtatious or romantic content.',
      siteRules.datingAndAttractionQuestionsAllowed ? 'Answer ordinary adult questions about dating, attraction, and relationships naturally.' : 'Avoid dating and attraction discussion.',
      siteRules.fictionalAdultRomanticHistoryAllowed ? 'Answer non-graphic questions about this fictional adult character’s romantic history in character.' : 'Avoid discussing romantic history.',
      siteRules.characterMustStayInPersonality ? 'Stay in the character’s distinct personality and voice in every reply.' : 'Use a neutral conversational voice.',
      siteRules.characterMustUseBackstoryNaturally ? 'Use the backstory naturally; do not recite it as a biography.' : 'The backstory may be summarized when relevant.',
      siteRules.avoidGenericRefusalsForAllowedTopics ? 'Do not give generic refusals for topics allowed by these rules; respond naturally in character.' : 'Use normal provider safety behavior.',
      'Graphic sexual content and sexual content involving minors are not allowed.'
    ].join(' ');
    const system = `Site rules: ${policyInstructions} You are ${character.name}, a distinct fictional adult companion. Stay in character in every reply. Your personality is the way you think, speak, flirt, joke, show affection, react, and make choices—not a list to repeat. Personality traits: ${character.personality || 'warm, curious, playful, emotionally attentive'}. Character backstory: ${character.bio || 'A fictional companion with her own interests, history, and point of view.'}. Use the backstory naturally as context when relevant; never recite it as an introduction, summarize it instead of answering, or invent major backstory facts that contradict it. Reply directly to what the user actually said, with specific details and natural conversational flow. Avoid generic assistant wording, repetitive follow-up questions, canned disclaimers, and responses that sound identical across characters. Let this character's own voice and traits lead the conversation. When mature mode is enabled, adult-to-adult romance, teasing, flirtation, sensual tension, and affectionate non-graphic roleplay are welcome when they fit the conversation; do not abruptly turn a flirtatious conversation into a generic or formal assistant response. Answer ordinary non-graphic questions about the fictional character's dating history, attraction, romantic experience, or sexual history (for example, a question about body count) in her own voice when appropriate. If the profile does not specify a detail, choose a plausible fictional answer or say she prefers to keep that detail private in a playful, in-character way; do not use a generic safety refusal for a non-graphic adult question. If a user mentions an adult venue or sexual topic, respond conversationally without describing graphic sexual acts. If asked about real-world activities, be honest that you are fictional while keeping the character's voice. Never claim to be human or claim real events happened. Do not generate graphic sexual content or sexual content involving minors.`;
    // A simple greeting should not inherit stale context from an earlier rejected topic.
    // Keep normal recent history for genuine follow-ups.
    const isFreshGreeting = /^(hi+|hey+|hello+|hii+|heya|good morning|good evening|good afternoon)[!.?,\s]*$/i.test(latest.trim());
    const context = isFreshGreeting
      ? [{ role: 'user', content: latest }]
      : incoming;
    const messages = context.map((m: any) => ({
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
    let reply = String(data?.choices?.[0]?.message?.content || '').trim();
    if (!reply) {
      console.warn('Groq returned an empty chat completion; retrying once with the latest message only:', JSON.stringify({ model: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b', finish_reason: data?.choices?.[0]?.finish_reason }));
      // Some provider responses can contain no user-facing content. Retry once without
      // earlier conversation turns so an old refusal or context cannot poison this reply.
      const retry = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: `You are ${character.name}, a fictional adult companion. Speak naturally in your own character voice, using this personality: ${character.personality || 'warm, curious, playful'}. Use this backstory as context, never repeat it as a biography: ${character.bio || 'A fictional companion with her own point of view.'}. Reply directly to the user's latest message. For adult conversations, keep romance and flirting non-graphic. Do not claim to be human.` },
            { role: 'user', content: latest.slice(0, 6000) }
          ],
          temperature: 0.7,
          max_completion_tokens: 700
        }),
        signal: AbortSignal.timeout(25000)
      });
      if (retry.ok) {
        const retryData = await retry.json();
        reply = String(retryData?.choices?.[0]?.message?.content || '').trim();
      } else {
        console.warn('Groq retry failed:', retry.status);
      }
      if (!reply) {
        return NextResponse.json({ error: 'The free AI provider returned no text twice. Please try again shortly.' }, { status: 502 });
      }
    }
    if (blocked(reply, siteRules)) {
      return NextResponse.json({ error: 'The generated response was filtered. Please try another message.' }, { status: 400 });
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OwnDream chat error:', error);
    return NextResponse.json({ error: 'Chat is temporarily unavailable. Please try again.' }, { status: 500 });
  }
}
