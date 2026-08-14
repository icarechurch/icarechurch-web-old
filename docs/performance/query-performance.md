# Query performance architecture

This project keeps database access inside Supabase Edge Functions. The browser calls the existing `content-data`, `analytics-data`, `activity-logs`, and `user-data` functions; it does not call tables or RPCs directly.

## Free-tier design

The implementation uses only PostgreSQL features already provided by Supabase:

- explicit projections instead of wildcard public reads;
- bounded public content pages and activity-log pages;
- composite indexes matching actual ordering and filter paths;
- one database-side dashboard overview RPC instead of five analytics requests;
- module-local in-memory request deduplication in the frontend;
- database triggers and keyed rollup tables for exact analytics and activity-log summaries.

No Redis, queue, cron service, third-party analytics provider, paid API, or hosted worker is required.

## Exact analytics

Raw `analytics_visits` rows remain the source of truth. The exact rollup migration adds keyed tables for unique visitors, daily unique visitors, and tracked pages, plus sharded counters. The insert trigger increments those keys and counters without scanning the raw visits table for every request.

`unique_visitors` remains exact: it counts distinct non-null `visitor_id` values, matching the previous behavior. Visits without a visitor ID still count toward total visits but not unique visitors.

## Read boundaries

Public list handlers select the fields required by their domain models, use stable secondary ID ordering, and cap list responses at 100 rows. Activity-log pages cap caller-provided limits at 100 while preserving exact filtered `totalCount`. Admin user loading uses one database-side profile/role join rather than two full reads and an in-memory merge.

Dashboard analytics returns grouped daily/page data, bounded recent visits, server-side content counts, and exact counter totals in one Edge Function request.

## Verification

Run the repository checks from the project root:

```powershell
npm run typecheck
npm run test:edge
npm run test:architecture
npm run test -- --spec cypress/e2e/performance
npm run build:dev
git diff --check
```

Supabase CLI is not part of this repository environment, so migration SQL is covered by static Edge contract tests here and remains a deployment-time Supabase migration step.
