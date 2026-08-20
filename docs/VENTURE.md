# Venture · Diagnóstico empresarial

## Run

```bash
npm install
npm run dev
```

Open `/venture`; local leads are visible at `/admin/leads`.

## Architecture

- Questions and conditional visibility: `src/config/venture-questions.ts`.
- Demo prices: `src/config/pricing.ts` under the `DEFAULT DEMO PRICING` marker.
- Recommendation, score, complexity, timeline and quote logic: `src/lib/recommendation-engine.ts`.
- Browser persistence: `src/lib/venture-storage.ts`.
- Analytics adapter: `src/lib/analytics.ts`.
- Supabase migration: `supabase/venture-schema.sql`.

## Environment

The MVP needs no variables. A Supabase adapter should use:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep the service-role key server-only. Implement browser/server clients in `src/lib/supabase` and replace the local repository methods without changing UI components.

## Integrations prepared

`trackEvent()` emits a `venture:analytics` browser event and sends the same payload to `dataLayer` when present. This boundary is ready for Google Analytics, Meta Pixel, LinkedIn and CRM adapters. CTA events, progress milestones, answers and quote generation are already instrumented.
