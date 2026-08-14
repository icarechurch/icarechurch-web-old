# Query Performance and Exact Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every data path bounded, indexed, deduplicated, and maintainable while preserving exact analytics counts and using only the existing Supabase free tier plus repository code.

**Architecture:** Keep all database access in Supabase Edge Functions. Replace the analytics trigger's per-visit full-table scans with exact incremental key tables and bounded rollups. Consolidate the dashboard into a bounded overview operation, optimize remaining Edge queries with explicit projections and pagination, and add in-memory request caching/deduplication in the existing frontend query hook.

**Tech Stack:** PostgreSQL/Supabase migrations and SQL functions, Supabase Edge Functions with Deno tests, React/TypeScript, Cypress browser tests, Ultracite/Biome, Git commits per independently verified change.

## Global Constraints

- **No external infrastructure:** use only the existing Supabase project/free tier and this repository; do not add Redis, queues, cron services, third-party analytics, paid APIs, or hosted workers.
- **Exact analytics:** `unique_visitors`, daily unique visitors, total visits, and tracked pages must remain exact with their current meanings.
- **No frontend database queries:** all table/RPC access remains inside Supabase Edge Functions.
- **No Vitest:** use Cypress for browser behavior and the repository's existing Deno tests for Edge Function query contracts.
- **TDD:** every production behavior change starts with a failing test, followed by the smallest implementation and a fresh passing verification.
- **Frequent commits:** every completed red-green cycle or independently reviewable migration/query change gets its own commit.
- **No silent API behavior changes:** preserve existing response shapes unless a paired frontend/API change updates both sides and has regression coverage.

---

## File Map

### Analytics write path

- Create: `supabase/migrations/mainstream/20260814000000_add_exact_analytics_rollups.sql` — exact visitor/page key tables, indexes, backfill, and replacement trigger.
- Create: `supabase/functions/analytics-data/analytics-rollup.test.ts` — static/contract assertions for the migration contract and handler boundaries where executable SQL integration is unavailable.
- Modify: `supabase/functions/analytics-data/queries.ts` — validate tracking payload shape and preserve the raw visit insert operation.
- Modify: `supabase/functions/analytics-data/analytics-queries.test.ts` — add bounded input and tracking contract coverage.

### Dashboard analytics read path

- Create: `supabase/functions/analytics-data/overview.ts` — types and database handlers for the bounded dashboard overview result.
- Modify: `supabase/functions/analytics-data/index.ts` — dispatch the overview operation.
- Modify: `supabase/functions/analytics-data/queries.ts` — replace row-heavy analytics reads with grouped, bounded database queries or the overview handler's shared helpers.
- Create: `supabase/functions/analytics-data/overview.test.ts` — failing-first handler/query shape tests.
- Modify: `src/domains/analytics/api/analytics.api.ts` — add the overview request and response types.
- Modify: `src/domains/analytics/hooks/useAnalytics.ts` — consume one overview result and retain the existing view model.
- Modify: `src/admin/analytics/pages/AdminAnalyticsPage.tsx` — remove five independent analytics hooks and render the overview result.
- Create/modify: `cypress/e2e/performance/admin-dashboard.cy.js` — verify dashboard rendering and bounded analytics request fan-out.

### Shared frontend request behavior

- Modify: `src/shared/hooks/simple-query-hooks.ts` — add typed, in-memory cache entries, in-flight promise deduplication, stale-time support, and cleanup without external state.
- Create: `cypress/e2e/performance/query-deduplication.cy.js` — verify duplicate data consumers do not create duplicate Edge requests.

### Activity logs and content reads

- Create: `supabase/migrations/mainstream/20260814000002_add_query_performance_indexes.sql` — activity-log indexes and database-side reductions.
- Create: `supabase/migrations/mainstream/20260814000003_add_content_query_indexes.sql` — indexes matching public content ordering.
- Create: `supabase/migrations/mainstream/20260814000004_add_admin_users_query.sql` — indexed admin profile/role join.
- Create: `supabase/migrations/mainstream/20260814000005_add_exact_activity_log_rollups.sql` — exact activity-log counters and type keys.
- Modify: `supabase/functions/activity-logs/queries.ts` — explicit list projection, bounded input, and database-side distinct/summary queries.
- Modify: `supabase/functions/activity-logs/activity-log-queries.test.ts` — query shape and bounds tests.
- Modify: `src/domains/activity-logs/api/activity-logs.api.ts` — adapt summary/filter response types if needed.
- Modify: `src/domains/activity-logs/hooks/useActivityLogs.ts` — remove client-side full-table reduction for summaries and enforce safe page sizes.
- Modify: `supabase/functions/content-data/*.ts` — explicit list projections, limits/cursors where response contracts permit, and no `select("*")` on read paths.
- Modify: `supabase/functions/content-data/resource-queries.test.ts` — update assertions from wildcard reads to explicit projections and bounds.
- Create: `supabase/functions/content-data/resource-columns.ts` — shared content read projections and list bounds.
- Create: `supabase/functions/content-data/content-index-migration.test.ts` — ordering index contract.
- Create: `supabase/functions/user-data/admin-query-migration.test.ts` — admin join/index contract.
- Modify: affected `src/domains/*/api/*.api.ts` and hooks — preserve response contracts while passing pagination parameters where introduced.
- Create/modify: `cypress/e2e/performance/bounded-data-requests.cy.js` — verify public/admin lists remain usable and request parameters stay bounded.

### Documentation and verification

- Create: `docs/performance/query-performance.md` — query ownership, exact analytics model, index rationale, and local verification commands.
- Modify: `AGENTS.md` only if the repository copy needs the performance/TDD commands documented; do not change unrelated standards.

---

## Task 1: Establish Performance Regression Contracts

**Files:**
- Create: `cypress/e2e/performance/admin-dashboard.cy.js`
- Create: `cypress/e2e/performance/query-deduplication.cy.js`
- Create: `cypress/e2e/performance/bounded-data-requests.cy.js`
- Modify: `cypress/support/e2e.js` only if shared intercept helpers are required.

**Interfaces:**
- Consumes: current Edge Function request envelope `{ resource, operation, input }`.
- Produces: browser regression contracts proving dashboard behavior, no more than one overview request, and bounded list requests.

- [ ] **Step 1: Write the failing dashboard request test**

  Intercept `analytics-data`, return the existing response shape, visit `/admin`, and assert the dashboard makes one `overview` request. Initially the current page makes five independent analytics requests, so this must fail on request count/operation.

- [ ] **Step 2: Run the focused Cypress test and verify the expected failure**

  Run:

  ```powershell
  npm run test -- --spec cypress/e2e/performance/admin-dashboard.cy.js
  ```

  Expected: FAIL because the current dashboard requests `summary`, `daily-visits`, `page-popularity`, `recent-visits`, and `content` separately.

- [ ] **Step 3: Write the failing duplicate-request test**

  Mount/visit a route that uses the same query through the initializer and page, intercept the relevant Edge Function, and assert one network request for the shared key. The current `useQuery` has no global cache, so this must fail.

- [ ] **Step 4: Run the focused test and verify it fails for duplicate requests**

  Run:

  ```powershell
  npm run test -- --spec cypress/e2e/performance/query-deduplication.cy.js
  ```

  Expected: FAIL with at least two identical Edge requests.

- [ ] **Step 5: Commit the red regression contracts**

  ```powershell
  git add cypress/e2e/performance
  git commit -m "test: define query performance regression contracts"
  ```

---

## Task 2: Add Exact Incremental Analytics Rollups

**Files:**
- Create: `supabase/migrations/mainstream/20260814000000_add_exact_analytics_rollups.sql`
- Create: `supabase/functions/analytics-data/analytics-rollup.test.ts`

**Interfaces:**
- Consumes: existing `analytics_visits`, `analytics_daily_stats`, and `analytics_overall_stats` rows.
- Produces: exact key tables and a replacement `update_daily_analytics_stats()` trigger that does not scan `analytics_visits` per insert.

- [ ] **Step 1: Write the failing migration contract test**

  Assert that the migration text contains the exact key tables, unique constraints, historical backfills, and replacement trigger, and does not contain the old per-insert `COUNT(DISTINCT ...)` scans. Assert that `visitor_id IS NOT NULL` is used for unique-visitor keys so null visitor IDs retain their old behavior.

- [ ] **Step 2: Run the focused Edge test and verify it fails**

  Run:

  ```powershell
  npm run test:edge -- supabase/functions/analytics-data/analytics-rollup.test.ts
  ```

  Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Implement the migration**

  Create exact key tables with primary/unique keys:

  ```sql
  CREATE TABLE public.analytics_unique_visitors (
    visitor_id VARCHAR(255) PRIMARY KEY,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE public.analytics_daily_unique_visitors (
    date DATE NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (date, page_path, visitor_id)
  );

  CREATE TABLE public.analytics_tracked_pages (
    page_path VARCHAR(255) PRIMARY KEY,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```

  Backfill with `INSERT ... SELECT DISTINCT ... ON CONFLICT DO NOTHING`, then rebuild `analytics_daily_stats` from the raw table once so historical totals and daily unique counts are exact. Add a seeded `analytics_counter_shards(counter_name, shard, counter)` table with 64 shards for each of `total_visits`, `unique_visitors`, and `total_pages`. The trigger hashes the visit ID, visitor ID, or page path to a shard and increments only the relevant shard after a successful keyed insert. Replace the trigger so each visit performs keyed inserts and short indexed updates instead of scanning the raw visit table. Update `get_analytics_summary()` to sum the small counter-shard sets and aggregate only `analytics_daily_stats`; do not use the legacy singleton row as a write hotspot. Keep the trigger and summary function `SECURITY DEFINER` with an explicit `search_path`.

- [ ] **Step 4: Run the focused test and verify it passes**

  Run:

  ```powershell
  npm run test:edge -- supabase/functions/analytics-data/analytics-rollup.test.ts
  ```

  Expected: PASS.

- [ ] **Step 5: Run the full Edge suite**

  ```powershell
  npm run test:edge
  ```

  Expected: all existing and new Edge tests pass.

- [ ] **Step 6: Commit the exact rollup migration**

  ```powershell
  git add supabase/migrations/mainstream/20260814000000_add_exact_analytics_rollups.sql supabase/functions/analytics-data/analytics-rollup.test.ts
  git commit -m "perf: replace analytics full scans with exact rollups"
  ```

---

## Task 3: Bound Analytics Handler Inputs and Reads

**Files:**
- Modify: `supabase/functions/analytics-data/queries.ts`
- Modify: `supabase/functions/analytics-data/analytics-queries.test.ts`

**Interfaces:**
- Consumes: current analytics operation names and response shapes.
- Produces: validated day/limit inputs and bounded raw analytics handlers used by the overview operation.

- [ ] **Step 1: Write failing tests for unsafe limits and day ranges**

  Add tests that call `recent-visits` with a negative/oversized limit and `daily-visits`/`page-popularity` with a negative or excessive `daysBack`. Assert a 400-style validation error or a defined safe bound, and assert that valid values retain the existing query fields.

- [ ] **Step 2: Run the focused tests and verify failure**

  ```powershell
  npm run test:edge -- supabase/functions/analytics-data/analytics-queries.test.ts
  ```

  Expected: FAIL because current handlers accept arbitrary values.

- [ ] **Step 3: Implement minimal shared analytics input validation**

  Add explicit constants for maximum days and recent rows. Reject non-integers and values outside the allowed range before building a query. Keep `track-visit` unchanged except for validating required bounded string fields at the function boundary.

- [ ] **Step 4: Run focused and full Edge tests**

  ```powershell
  npm run test:edge -- supabase/functions/analytics-data/analytics-queries.test.ts
  npm run test:edge
  ```

  Expected: PASS.

- [ ] **Step 5: Commit the bounded analytics handlers**

  ```powershell
  git add supabase/functions/analytics-data/queries.ts supabase/functions/analytics-data/analytics-queries.test.ts
  git commit -m "perf: bound analytics query inputs"
  ```

---

## Task 4: Consolidate the Dashboard Overview

**Files:**
- Create: `supabase/functions/analytics-data/overview.ts`
- Create: `supabase/functions/analytics-data/overview.test.ts`
- Modify: `supabase/functions/analytics-data/index.ts`
- Modify: `src/domains/analytics/api/analytics.api.ts`
- Modify: `src/domains/analytics/hooks/useAnalytics.ts`
- Modify: `src/admin/analytics/pages/AdminAnalyticsPage.tsx`
- Modify: `cypress/e2e/performance/admin-dashboard.cy.js`

**Interfaces:**
- Consumes: existing summary/daily/page/recent/content semantics.
- Produces: `analytics-data` operation `overview` returning `{ summary, dailyVisits, pagePopularity, recentVisits, contentAnalytics }` with all list portions bounded and grouped server-side.

- [ ] **Step 1: Write the failing overview handler tests**

  Assert that the handler performs grouped daily/page queries, a bounded recent query, and count-based content queries. Assert that the returned shape contains the existing dashboard fields and that page popularity is limited to the dashboard's required top rows.

- [ ] **Step 2: Run the focused overview tests and verify failure**

  ```powershell
  npm run test:edge -- supabase/functions/analytics-data/overview.test.ts
  ```

  Expected: FAIL because `overview.ts` and the `overview` dispatch operation do not exist.

- [ ] **Step 3: Implement the Edge overview operation**

  Use one Edge request and bounded database work. Aggregate daily stats by date and page stats by page in SQL/RPC helpers rather than returning every daily/page row to the browser. Use count queries for ministries and event statuses. Keep recent visits explicitly projected and capped.

- [ ] **Step 4: Run Edge tests and verify the handler passes**

  ```powershell
  npm run test:edge
  ```

  Expected: PASS.

- [ ] **Step 5: Write the frontend integration before changing the page**

  Add the typed `getOverview()` API call and an overview hook test/contract through Cypress. The Cypress dashboard test from Task 1 remains red until the page uses this operation.

- [ ] **Step 6: Implement the frontend overview hook and page migration**

  Replace the five independent hooks in `AdminAnalyticsPage` with one overview query. Keep chart formatting local only for presentation; remove client-side aggregation of unbounded database rows.

- [ ] **Step 7: Run dashboard Cypress regression**

  ```powershell
  npm run test -- --spec cypress/e2e/performance/admin-dashboard.cy.js
  ```

  Expected: PASS with one `overview` analytics request and the dashboard content visible.

- [ ] **Step 8: Commit the dashboard consolidation**

  ```powershell
  git add supabase/functions/analytics-data src/domains/analytics src/admin/analytics/pages/AdminAnalyticsPage.tsx cypress/e2e/performance/admin-dashboard.cy.js
  git commit -m "perf: consolidate admin analytics overview"
  ```

---

## Task 5: Add Shared In-Memory Query Caching and Deduplication

**Files:**
- Modify: `src/shared/hooks/simple-query-hooks.ts`
- Modify: `src/domains/analytics/hooks/useAnalytics.ts` only where stale-time options are needed.
- Modify: `cypress/e2e/performance/query-deduplication.cy.js`

**Interfaces:**
- Consumes: existing `useQuery({ queryKey, queryFn, enabled, refetchInterval, retry })` callers.
- Produces: request sharing by serialized query key, configurable stale time, interval refetch without concurrent duplicate requests, and cleanup when no consumers remain.

- [ ] **Step 1: Write failing hook behavior tests through Cypress**

  Assert that two consumers of one query key share one in-flight request, that a fresh cached result is reused, and that an explicit invalidation still refetches.

- [ ] **Step 2: Run the focused Cypress test and verify failure**

  ```powershell
  npm run test -- --spec cypress/e2e/performance/query-deduplication.cy.js
  ```

  Expected: FAIL with duplicate requests because the current hook stores data only inside each component instance.

- [ ] **Step 3: Implement the smallest cache and single-flight registry**

  Store entries by stable serialized key in module-local memory. Each entry contains data/error/status, an expiry timestamp, and an optional in-flight promise. Reuse the in-flight promise, honor `enabled`, and ensure interval/refetch calls do not overlap. Do not add a package or external persistence.

- [ ] **Step 4: Run the focused and architecture Cypress tests**

  ```powershell
  npm run test -- --spec cypress/e2e/performance/query-deduplication.cy.js
  npm run test:architecture
  ```

  Expected: PASS; no frontend table/RPC access is introduced.

- [ ] **Step 5: Commit the request deduplication**

  ```powershell
  git add src/shared/hooks/simple-query-hooks.ts src/domains/analytics/hooks/useAnalytics.ts cypress/e2e/performance/query-deduplication.cy.js
  git commit -m "perf: deduplicate frontend Edge requests"
  ```

---

## Task 6: Optimize Activity Log Queries

**Files:**
- Create: `supabase/migrations/mainstream/20260814000002_add_query_performance_indexes.sql`
- Modify: `supabase/functions/activity-logs/queries.ts`
- Modify: `supabase/functions/activity-logs/activity-log-queries.test.ts`
- Modify: `src/domains/activity-logs/api/activity-logs.api.ts`
- Modify: `src/domains/activity-logs/hooks/useActivityLogs.ts`

**Interfaces:**
- Consumes: existing log list/summary/action-types/entity-types response contracts.
- Produces: explicit projected log rows, indexed filter/order paths, and database-side distinct action/entity types and exact summary totals.

- [ ] **Step 1: Write failing query contract tests**

  Assert list uses only the columns rendered/exported by `AdminLogsPage`, action/entity type handlers use database-side distinct values, and all list limits are clamped to a safe maximum. Assert filtered list queries retain date/action/entity/user filters.

- [ ] **Step 2: Run the focused Edge tests and verify failure**

  ```powershell
  npm run test:edge -- supabase/functions/activity-logs/activity-log-queries.test.ts
  ```

  Expected: FAIL because current handlers use `select("*", { count: "exact" })` and return duplicate summary rows.

- [ ] **Step 3: Add indexes matching actual access patterns**

  Add idempotent indexes for recent ordering and common combinations such as `(action_type, created_at DESC)`, `(entity_type, created_at DESC)`, `(user_id, created_at DESC)`, and `(created_at DESC)` where not already present. Do not create indexes speculatively for unused columns.

- [ ] **Step 4: Implement explicit projections, distinct handlers, and bounds**

  Keep exact `totalCount` for paginated logs, but bound page size and use the new indexes. Return unique action/entity types directly so the browser no longer downloads the entire log table to reduce it.

- [ ] **Step 5: Run Edge tests and commit**

  ```powershell
  npm run test:edge
  git add supabase/migrations/mainstream/20260814000002_add_query_performance_indexes.sql supabase/functions/activity-logs src/domains/activity-logs
  git commit -m "perf: optimize activity log reads"
  ```

---

## Task 7: Remove Wildcard Content Reads and Bound Lists

**Files:**
- Modify: `supabase/functions/content-data/church-info.ts`
- Modify: `supabase/functions/content-data/events.ts`
- Modify: `supabase/functions/content-data/event-popup.ts`
- Modify: `supabase/functions/content-data/gallery.ts`
- Modify: `supabase/functions/content-data/giving.ts`
- Modify: `supabase/functions/content-data/ministries.ts`
- Modify: `supabase/functions/content-data/pastors.ts`
- Modify: `supabase/functions/content-data/sermons.ts`
- Modify: `supabase/functions/content-data/service-times.ts`
- Modify: `supabase/functions/content-data/resource-queries.test.ts`
- Modify: affected domain API/hooks and Cypress performance coverage.

**Interfaces:**
- Consumes: existing typed content responses and form mutation responses.
- Produces: explicit read projections and safe list bounds without removing fields required by public/admin screens.

- [ ] **Step 1: Write failing resource query tests**

  For each list handler, assert the exact selected fields used by its domain type and a defined maximum list size. For singleton reads, assert only the fields used by the corresponding view are selected. Keep mutation `.select()` responses unchanged until their consumers are audited.

- [ ] **Step 2: Run the resource tests and verify failure**

  ```powershell
  npm run test:edge -- supabase/functions/content-data/resource-queries.test.ts
  ```

  Expected: FAIL because current reads use wildcard projections and unbounded lists.

- [ ] **Step 3: Implement explicit projections and safe bounds**

  Use the model fields as the projection source. Add deterministic ordering with a stable secondary `id` order where necessary. Add indexes for ordered list columns only where the schema lacks a usable index. Do not introduce a separate service, cache, or storage system.

- [ ] **Step 4: Run resource, architecture, and browser regression tests**

  ```powershell
  npm run test:edge
  npm run test:architecture
  npm run test -- --spec cypress/e2e/performance/bounded-data-requests.cy.js
  ```

  Expected: PASS; public pages and admin editors still render their existing content.

- [ ] **Step 5: Commit the content query optimization**

  ```powershell
  git add supabase/functions/content-data src/domains cypress/e2e/performance/bounded-data-requests.cy.js
  git commit -m "perf: bound content data reads"
  ```

---

## Task 8: Verify, Document, and Review the Complete Change

**Files:**
- Create: `docs/performance/query-performance.md`
- Modify: any focused tests only if verification exposes a real contract gap.

**Interfaces:**
- Consumes: all optimized Edge operations, migrations, and Cypress contracts.
- Produces: maintainer documentation and verified repository state.

- [ ] **Step 1: Write documentation checks**

  Document that raw visits are retained, exact key tables are maintained in Supabase PostgreSQL, all reads go through Edge Functions, limits are enforced at the Edge boundary, and no external infrastructure is required.

- [ ] **Step 2: Run the full verification matrix**

  ```powershell
  npm run typecheck
  npm run test:edge
  npm run test:architecture
  npm run test -- --spec cypress/e2e/performance
  npm run build:dev
  npm exec -- ultracite check
  git diff --check
  git status --short
  ```

  Expected: all commands exit 0, Cypress reports no failures, and `git diff --check` reports no whitespace errors. If Supabase migration execution is available in the local environment, also run the repository's local migration verification; otherwise report that production migration execution remains a deployment step rather than claiming it was applied.

- [ ] **Step 3: Review the plan against requirements**

  Confirm exact unique counts, no external infrastructure, no frontend table/RPC queries, bounded all-query behavior, dashboard recovery coverage, Cypress coverage, Edge coverage, and frequent commits. Report any unverified production-only item explicitly.

- [ ] **Step 4: Commit documentation and final verification**

  ```powershell
  git add docs/performance/query-performance.md
  git commit -m "docs: document query performance architecture"
  git log --oneline -12
  ```
