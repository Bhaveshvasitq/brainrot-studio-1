# Soul / Brainrot Studio — SpicyAPI pilot

Status: **scaffolding only; paid calls are not approved or enabled by default.**

## Spending rules

- Monthly AI-provider budget ceiling: ₹5,000 across all providers.
- Proposed first SpicyAPI pilot ceiling: US$10 (about ₹951 before FX spread, taxes, or payment fees); this is a proposed cap, not purchase authorization.
- Manual top-ups only. Never implement automatic top-ups.
- Do not buy credits, enter payment details, create/activate paid keys, or incur charges until the user reviews the exact provider, current pricing and checkout total and explicitly approves the purchase.
- Existing monthly plans remain Starter $20, Pro $40 and Ultimate $70. Subscription prices are separate from provider costs; checkout is not implied to be live.
- Do not enable live calls until durable usage tracking, a concurrency-safe spend reservation, per-user limits, and monthly rollover are implemented and tested.

## Server-side flags

Never expose provider secrets using NEXT_PUBLIC_*.

- SPICYAPI_API_KEY: server-side key only.
- SPICYAPI_LIVE_CALLS_ENABLED: unset or false before approval.
- SPICYAPI_PURCHASE_APPROVAL_ID: unset before explicit purchase approval.
- SPICYAPI_MONTHLY_SPEND_LIMIT_USD: required as an additional guard for live calls; it does not replace a durable usage ledger.
- Optional model selectors: SPICYAPI_CHAT_MODEL, SPICYAPI_IMAGE_MODEL, SPICYAPI_VOICE_MODEL, SPICYAPI_VIDEO_MODEL.

## Official list prices checked 14 October 2026

Prices may change; verify exact model and checkout totals immediately before any purchase.

- Chat spicy-companion-1-flash: $0.10 / 1M input tokens and $0.80 / 1M output tokens.
- Chat spicy-companion-1: $1.00 / 1M input tokens and $2.80 / 1M output tokens.
- Image spicy-image-1: $0.06 / image; spicy-image-1-pro: $0.09 / image.
- Voice spicy-voice-1: $0.30 / 10,000 characters; spicy-voice-2: $0.40 / 10,000 characters.
- Video spicy-motion-3: $0.10 / second at 480p, $0.20 / second at 720p, $0.40 / second at 1080p.
- A 5-second 480p spicy-motion-3 video is approximately $0.50 before fees/taxes.

Official references:
- https://www.spicyapi.com/docs/api/chat-completions
- https://www.spicyapi.com/docs/api/create-image
- https://www.spicyapi.com/docs/api/create-speech
- https://www.spicyapi.com/docs/api/create-video
- https://www.spicyapi.com/acceptable-use

## Policy and product safeguards

SpicyAPI permits explicit sexual content between consenting adults, but prohibits depictions of real identifiable people in images/video even if consent is claimed. It prohibits minors and young-looking/youth-coded content, non-consensual intimate imagery, sexual violence in generated media, and other listed categories. Real-person voice cloning requires documented consent. Provider screening is not a substitute for Soul's own moderation.

Before public launch, implement and test:
- Meaningful 18+ access gating and jurisdictional/legal review.
- Pre-generation prompt moderation and post-generation output review.
- Abuse reporting and a process to respond to reports within 24 hours.
- AI-generated media disclosures and appropriate metadata preservation.
- Per-user rate limits and abuse controls.
- A durable usage ledger with atomic spend reservations and a hard monthly budget, including concurrent requests and failed/refunded jobs.
- Secure media access and retention/deletion rules, plus a privacy review of provider logs and retention.

This adapter is not a completed production billing system. Live calls must remain disabled until these controls are in place and the user separately approves the exact purchase.
