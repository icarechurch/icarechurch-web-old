# Frontend data access

Frontend React code does not build Supabase table queries or call database RPCs. It calls a domain service in `src/integrations/supabase/services/`, and that service invokes the corresponding Supabase Edge Function.

Queries live in resource modules under `supabase/functions/` and are organized as:

```text
business domain → resource → operation
```

Current domains:

- `content-data`: ministries, events, service times, church information, sermons, gallery, pastors, event popup, and giving.
- `analytics-data`: page visits, summaries, daily visits, page popularity, recent visits, and content analytics.
- `activity-logs`: filtered logs, summaries, clearing, inserts, and filter-option reads.
- `user-data`: admin users, profiles, roles, permissions, and user deletion.

The frontend may retain client-native Supabase APIs that are not table queries, such as Auth, Storage, and Realtime. Storage calls are intentionally kept in `storage.service.ts`.

The frontend architecture guard and user-facing behavior tests run in Cypress. Edge-function modules have focused Deno tests that record the Supabase query-builder calls; those tests protect query shape at the runtime where the queries execute.

Run the regression suites with:

```text
npm test
npm run test:edge
npm run typecheck
```
