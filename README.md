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
- Server-side  no boundaries against sexual content involving minors and graphic sexual content
- Mobile bottom navigation and desktop sidebar

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

## Live AI

This repository's chat route currently uses Groq's OpenAI-compatible endpoint. Set these Vercel environment variables:

- `GROQ_API_KEY` (required for live AI)
- optional `GROQ_CHAT_MODEL` (defaults to `openai/gpt-oss-20b`)

Without `GROQ_API_KEY`, live AI replies will not work; the app may show its demo interface, but it cannot generate real provider responses. Never commit API keys to GitHub.

## Important production step

The current starter stores demo conversations and custom souls in browser local storage. For a production multi-user service, add authentication plus a database/storage layer before collecting real user information.

## Content boundaries

Soul supports adult romance, affection and mature graphic roleplay between adults. It does generate graphic sexual content or sexual content involving minors.

## Deployment

The repository is designed for Vercel + Next.js. With Git integration connected, pushing the production branch creates a new deployment. Verify the newest deployment before testing the production URL.
