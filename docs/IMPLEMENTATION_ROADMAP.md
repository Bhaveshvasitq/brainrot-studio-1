# Soul / Brainrot Studio — milestone implementation plan

## Guardrails
- Preserve the existing repository and work on `ai-companion-rebuild` until preview checks pass.
- Planned monthly tiers remain **$20, $40 and $70**.
- Free/open-source first. Do not purchase services, enable billing, or activate paid APIs without the owner's explicit approval for that exact service and cost.
- Release budget only after the previous milestone passes acceptance testing. ₹10,00,000 is a maximum planning ceiling, not an automatic spend authorization.

## Milestone 1 — safe preview and product foundation
- [x] Add a transparent pricing page for $20 / $40 / $70 monthly plans.
- [x] Link the companion hub to the pricing page.
- [x] Keep checkout disconnected and clearly label plans as planned.
- [ ] Build and test the preview deployment.
- [ ] Confirm Supabase URL/key configuration in the deployment without exposing secrets.
- Acceptance: homepage, chat demo, character creation, and pricing route load; no payment is taken and no paid provider is called.

## Milestone 2 — account and private data
- Use the existing Supabase project only after confirming current project settings and free-tier limits.
- Add authentication, per-user companion records, conversations, and row-level security (RLS).
- Migrate browser-only data carefully; do not upload local conversations without a clear user action.
- Acceptance: two test accounts cannot read each other's records; sign-out and account deletion paths work.

## Milestone 3 — chat reliability and voice
- Add request validation, bounded input/history, friendly provider errors, and abuse/rate limits.
- Keep browser text-to-speech as the default no-cost voice feature.
- Evaluate free local/open-source model hosting before considering hosted APIs.
- Acceptance: demo mode remains usable with no API keys; no secret is sent to the browser.

## Milestone 4 — image generation
- First integrate a local/open-source workflow that can be run without paid API calls, and document hardware requirements.
- Only consider a hosted provider after comparing cost per image, usage caps, privacy, and licensing; request approval for the specific provider and maximum spend first.
- Acceptance: disabled-by-default integration, clear usage accounting, content rules, and a tested failure state.

## Milestone 5 — video generation
- Prototype a queue/job interface and local workflow research first; video can be resource-intensive.
- Do not activate a paid video service or GPU rental without separate approval.
- Acceptance: users see job status, limits, errors, and storage cleanup behavior.

## Milestone 6 — subscriptions and credits
- Keep $20 / $40 / $70 monthly tiers.
- Finalize allowances only after measuring actual costs and running abuse tests.
- Compare payment providers and tax/compliance requirements; do not create a live checkout until a provider and its fees are approved.
- Acceptance: sandbox purchase tests, idempotent webhooks, server-side credit ledger, refunds/cancellations, and no client-side authority over balances.

## Budget release rule
Each milestone gets its own estimate, test checklist, and explicit approval before any spending. The total planned spend must stay at or below ₹10,00,000; unused funds remain unspent.
