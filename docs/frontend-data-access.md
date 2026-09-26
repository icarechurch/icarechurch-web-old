# Frontend data access

Frontend React code does not build Supabase table queries or call database RPCs. Persona experiences call APIs and hooks in `icarecenter-frontend/src/domains/<domain>/`, and those APIs invoke the corresponding Supabase Edge Function through `icarecenter-frontend/src/infrastructure/supabase/`.

The frontend is organized as vertical slices:

- `icarecenter-frontend/src/app/`: application composition, providers, initialization, and routes.
- `icarecenter-frontend/src/domains/`: shared business-domain models, hooks, and Edge Function adapters.
- `icarecenter-frontend/src/user/`: public and authenticated user experiences.
- `icarecenter-frontend/src/admin/`: administrator pages and composition.
- `icarecenter-frontend/src/moderator/`: moderator pages and composition.
- `icarecenter-frontend/src/shared/`: generic UI, layout, hooks, constants, and utilities.
- `icarecenter-frontend/src/infrastructure/`: Supabase, Storage, and Leaflet clients.

Deleted legacy locations such as `icarecenter-frontend/src/pages/`, `icarecenter-frontend/src/components/admin/`, and `icarecenter-frontend/src/hooks/useChurchData.tsx` must not be recreated or replaced with compatibility shims.

Queries live in resource modules under `supabase/functions/` and are organized as:

```text
business domain → resource → operation
```

Current domains:

- `content-data`: ministries, events, service times, church information, sermons, gallery, pastors, event popup, and giving.
- `analytics-data`: page visits, summaries, daily visits, page popularity, recent visits, and content analytics.
- `activity-logs`: filtered logs, summaries, clearing, inserts, and filter-option reads.
- `user-data`: admin users, profiles, roles, permissions, and user deletion.

The frontend may retain client-native Supabase APIs that are not table queries, such as Auth, Storage, and Realtime. Storage calls are intentionally kept in `icarecenter-frontend/src/infrastructure/supabase/storage.ts`.

The frontend architecture guard and user-facing behavior tests run in Cypress. Edge-function modules have focused Deno tests that record the Supabase query-builder calls; those tests protect query shape at the runtime where the queries execute.

Run the regression suites from `icarecenter-frontend/` with:

```text
npm test
npm run test:architecture
npm run test:edge
npm run typecheck
npm run build:dev
```
