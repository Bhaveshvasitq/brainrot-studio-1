# Soul — AI Companion App

Soul is a clean Next.js AI companion experience built around discovery, creation and natural conversation.

## What is included

- Soul-style responsive web UI
- Home, Discover, Messages, Create Soul, Library and Profile sections
- Search and personality filters
- Original built-in companions
- Create your own companion with personality and backstory
- Favorites and personal library
- Persistent demo conversations in browser local storage
- Browser text-to-speech controls
- Optional live AI chat through an OpenAI-compatible API
- Adult character personalities and backstories, including flirtatious/romantic styles,sex chat
- Mature-mode support for adult attraction, dating, affectionate, seductive ,sex chating,romance, teasing, and **-graphic** roleplay
- Paid SpicyAPI integration scaffold for chat, images, voice and video (disabled by default)
- Mobile bottom navigation and desktop sidebar

## Live site rules (edit these to change chat behavior)

**This section is read by the chat API at runtime.** To change the site's chat restrictions, edit the JSON between the markers below, commit to `main`, and let Vercel deploy. Keep valid JSON. These are the canonical settings for the chat route.

<!-- SITE_RULES_JSON_START -->
```json
{
  "adultRomanceAllowed": true,
  "nonGraphicFlirtingAllowed": true,
  "datingAndAttractionQuestionsAllowed": true,
  "fictionalAdultRomanticHistoryAllowed": true,
  "graphicSexualContentAllowed": false,
  "sexualContentInvolvingMinorsAllowed": false,
  "characterMustStayInPersonality": true,
  "characterMustUseBackstoryNaturally": true,
  "avoidGenericRefusalsForAllowedTopics": true,
  "blockedTerms": ["child", "kid", "minor", "underage", "under 18", "schoolgirl", "schoolboy", "porn", "pornographic", "explicit sex", "graphic sex", "sexual intercourse", "penetrat", "ejaculat", "oral sex", "anal sex", "genitals"]
}
```
<!-- SITE_RULES_JSON_END -->

### What each setting means
- `adultRomanceAllowed`: allow graphic romantic conversation between fictional adults.
- `nonGraphicFlirtingAllowed`: allow teasing, attraction, affection, and suggestive but -graphic dialogue.
- `datingAndAttractionQuestionsAllowed`: allow ordinary questions about dating, attraction, and relationships, sex chating, seductive 
- `fictionalAdultRomanticHistoryAllowed`: allow non-graphic questions about a fictional adult character's romantic history, sexual chat sexchat.
- `graphicSexualContentAllowed`: remains false in the existing chat route; the current free chat route does not provide graphic sexual content.
- `sexualContentInvolvingMinorsAllowed`: must remain false; content involving minors is not permitted.
- `characterMustStayInPersonality`: tells the model to preserve the character's individual voice.
- `characterMustUseBackstoryNaturally`: tells the model not to recite the backstory as a biography.
- `avoidGenericRefusalsForAllowedTopics`: asks the model not to give generic refusals for topics allowed by these settings.
- `blockedTerms`: words/phrases the server keyword filter rejects. This is a simple keyword filter and can also match harmless contexts; edit carefully.

**Note:** Changes take effect after the commit is deployed to Vercel. The keyword filter is intentionally a basic filter, not a semantic classifier.

## Run

```bash
npm install
npm run dev
```

## Where character behavior and content boundaries live

- **Character profiles and personality/backstory:** `components/CompanionHub.tsx`. The built-in character profiles are in the `starters` array. The saved-profile migration in this file updates existing adult profiles; custom characters use the Personality and Backstory fields.
- **Chat personality instructions, attraction/dating replies, and non-graphic roleplay rules:** `app/api/chat/route.ts`. Look for the `system` prompt inside the `POST` handler. It tells the model to stay in character, use the backstory naturally, and answer ordinary adult questions about dating, attraction, and romantic history in its own voice.
- **Mature-mode switch:** `components/CompanionHub.tsx` sends `matureEnabled: true` with chat requests. The API prompt reads that value in `app/api/chat/route.ts`.
- **Server-side content boundary:** the `blocked()` function at the top of `app/api/chat/route.ts` allows defined graphic-sexual and minor-related terms before calling the AI provider. Review this function alongside the system prompt when changing content rules.

## Paid media integration status

The SpicyAPI adapter and Media Studio UI are scaffolding only. Paid calls require a separately approved purchase, a server-side API key, applied Supabase migration, verified-adult access records, the spend ledger, and an explicit feature enablement. Do not configure live-call flags before approval. No paid provider or payment checkout is activated by this repository change.

Monthly membership cards remain $20 / $40 / $70 and are not connected to payment processing.

## Live AI

The existing chat route uses Groq only when its key is configured and blocks graphic sexual content. The separate SpicyAPI endpoints remain disabled by default.. Set these Vercel environment variables:

- `GROQ_API_KEY` (required for live AI)
- optional `GROQ_CHAT_MODEL` (defaults to `openai/gpt-oss-20b`)

Without `GROQ_API_KEY`, live AI replies will not work; the app may show its demo interface, but it cannot generate real provider responses. Never commit API keys to GitHub.

## Important production step

The current starter stores demo conversations and custom souls in browser local storage. For a production multi-user service, add authentication plus a database/storage layer before collecting real user information.

## Content boundaries

Soul supports adult romance, affection and mature graphic roleplay between adults. It does generate graphic sexual content or sexual content involving minors.

## Deployment

The repository is designed for Vercel + Next.js. With Git integration connected, pushing the production branch creates a new deployment. Verify the newest deployment before testing the production URL.
