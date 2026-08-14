# Frontend Database Query Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all frontend database table queries and RPC calls while preserving the existing service method APIs and moving query execution into maintainable, domain-oriented Supabase Edge Functions.

**Architecture:** Existing frontend services remain the compatibility boundary, but become typed `supabase.functions.invoke` adapters. Supabase Edge Functions are grouped by domain (`content-data`, `analytics-data`, `activity-logs`, and `user-management`), with one resource module per table/RPC concern. Query clauses are copied unchanged into Edge resource modules; hooks keep their existing cache keys, UI behavior, and client-side transformations.

**Tech Stack:** React 18, TypeScript, Vite, Supabase JS v2, Supabase Edge Functions/Deno, Vitest, Deno test runner, Cypress, Ultracite/Biome.

## Global Constraints

- No `.from(...)`, `.rpc(...)`, or other database query builders may remain in frontend `src/` files.
- Existing frontend service method names and hook-facing return values remain compatible.
- Move existing table queries and RPC calls without changing their table names, selected columns, filters, ordering, pagination, RPC names, or fallback behavior.
- Supabase Auth methods, Storage operations, and Realtime subscriptions remain native client integrations.
- Service-role credentials are never imported, bundled, or exposed in `src/`.
- No database migration, schema, RLS policy, or unrelated UI change is part of this work.
- Every production change follows RED → GREEN → REFACTOR; the focused test must fail before the implementation is written.
- Every task ends with focused tests plus `npm run typecheck`; full verification runs before completion.

---

## File map

### Shared transport and test setup

- Create `vitest.config.ts`: Vitest configuration with the `@/*` alias and Node environment.
- Modify `package.json` and `package-lock.json`: add Vitest scripts and the test dependency.
- Create `src/integrations/supabase/functions.ts`: typed frontend Edge Function invocation and response unwrapping.
- Create `supabase/functions/deno.json`: Deno test/import configuration for Edge Functions.
- Create `supabase/functions/_shared/cors.ts`: reusable CORS headers and OPTIONS response.
- Create `supabase/functions/_shared/errors.ts`: normalized HTTP/function errors.
- Create `supabase/functions/_shared/responses.ts`: success and error response envelopes.
- Create `supabase/functions/_shared/request.ts`: request parsing and operation validation.
- Create `supabase/functions/_shared/auth.ts`: caller authentication and role checks.

### Content transport

- Create `supabase/functions/content-data/index.ts`: dispatch and authorization for content operations.
- Create `supabase/functions/content-data/ministries.ts`, `events.ts`, `service-times.ts`, `church-info.ts`, `sermons.ts`, `gallery.ts`, `pastors.ts`, `event-popup.ts`, and `giving.ts`: unchanged resource queries.
- Modify the existing content service files under `src/integrations/supabase/services/`: replace query builders with function adapters while preserving exported methods and types.
- Modify `src/hooks/useGiving.ts`: use `givingService` instead of a browser table query.
- Modify `src/hooks/useEventPopup.ts`: continue using `eventPopupService`; only its service transport changes.

### Analytics and logs

- Create `src/integrations/supabase/services/analytics.service.ts`: analytics function adapters and response types.
- Create `src/integrations/supabase/services/activity-logs.service.ts`: activity-log function adapters and response types.
- Create `supabase/functions/analytics-data/index.ts`, `visits.ts`, `summaries.ts`, and `content-counts.ts`.
- Create `supabase/functions/activity-logs/index.ts`, `queries.ts`, and `writes.ts`.
- Modify `src/hooks/useAnalytics.ts`: remove table/RPC access; retain consent, browser IDs, client-side grouping, sorting, and fallbacks.
- Modify `src/hooks/useLogs.ts`: remove table access; retain hook return shapes, filters, intervals, and silent logging behavior.

### User and account transport

- Create `supabase/functions/user-management/index.ts`, `profiles.ts`, `roles.ts`, and `allowed-tabs.ts`.
- Modify `src/integrations/supabase/services/admin.service.ts`, `auth.service.ts`, `profiles.service.ts`, and `users.service.ts` to invoke Edge Functions only.
- Leave `src/integrations/supabase/services/storage.service.ts` on Supabase Storage APIs.
- Leave `src/components/admin/AdminUsers.tsx` using the existing `create-user` function invocation.
- Add tests around `supabase/functions/create-user/index.ts` without changing its existing query or privileged-auth behavior.

### Architecture guard and docs

- Create `scripts/verify-no-frontend-db-queries.mjs`: fail when frontend source contains table query builders or RPC calls; allow `supabase.storage.from(...)`.
- Modify `package.json`: add `test:architecture` and include it in the normal test/verification workflow.
- Modify `documentations/ARCHITECTURE.md`, `documentations/API.md`, and `documentations/DEVELOPMENT.md`: document Edge Function ownership, service contracts, local tests, and the no-frontend-query rule.

---

## Task 1: Establish the typed function transport and test harness

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`, `package-lock.json`
- Create: `src/integrations/supabase/functions.ts`
- Create: `src/integrations/supabase/functions.test.ts`
- Create: `supabase/functions/deno.json`
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/errors.ts`
- Create: `supabase/functions/_shared/responses.ts`
- Create: `supabase/functions/_shared/request.ts`
- Create: `supabase/functions/_shared/auth.ts`
- Create: `supabase/functions/_shared/shared.test.ts`

**Interfaces:**
- Produces `invokeFunction<T>(functionName: string, request: FunctionRequest): Promise<T>` for all frontend services.
- Produces `FunctionRequest = { resource: string; operation: string; input?: unknown }`.
- Produces Edge helpers `ok(data)`, `fail(status, code, message)`, `parseRequest(req)`, `requireUser(req)`, and `requireRole(req, roles)`.

- [ ] **Step 1: Add the failing frontend transport test.**

```ts
it("unwraps a successful Edge Function response", async () => {
  vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: [{ id: "event-1" }] },
    error: null,
  });

  await expect(
    invokeFunction("content-data", {
      resource: "events",
      operation: "list",
    }),
  ).resolves.toEqual([{ id: "event-1" }]);
});
```

- [ ] **Step 2: Run the focused test and confirm the intended failure.**

Run: `npx vitest run src/integrations/supabase/functions.test.ts`

Expected: FAIL because `invokeFunction` and the Vitest configuration do not yet exist.

- [ ] **Step 3: Add the minimum Vitest and transport implementation.**

```ts
export type FunctionRequest = {
  resource: string;
  operation: string;
  input?: unknown;
};

export async function invokeFunction<T>(
  functionName: string,
  request: FunctionRequest,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: request,
  });

  if (error) throw error;
  if (!data || !("data" in data)) {
    throw new Error("Invalid Edge Function response");
  }

  return data.data as T;
}
```

Add `"test": "vitest run"`, `"test:watch": "vitest"`, and the Vitest dependency. Configure the `@` alias to resolve to `src`.

- [ ] **Step 4: Add failing shared Edge contract tests, then implement the helpers.**

The tests must assert that `OPTIONS` returns CORS headers, malformed JSON returns `400`, missing authentication returns `401`, and insufficient roles return `403`. Implement the helpers with `Response.json`-compatible envelopes and no resource-specific logic.

Run: `deno test -A supabase/functions/_shared/shared.test.ts`

Expected after implementation: PASS.

- [ ] **Step 5: Run the focused frontend and Edge tests plus typecheck.**

Run: `npx vitest run src/integrations/supabase/functions.test.ts`; `deno test -A supabase/functions/_shared/shared.test.ts`; `npm run typecheck`

Expected: all focused tests pass and TypeScript exits with code `0`.

- [ ] **Step 6: Commit the transport foundation.**

```powershell
git add package.json package-lock.json vitest.config.ts src/integrations/supabase/functions.ts src/integrations/supabase/functions.test.ts supabase/functions/deno.json supabase/functions/_shared
git commit -m "test: add edge function transport contracts"
```

## Task 2: Move public content reads behind `content-data`

**Files:**
- Create: `supabase/functions/content-data/index.ts`, `ministries.ts`, `events.ts`, `service-times.ts`, `church-info.ts`, `sermons.ts`, `gallery.ts`, `pastors.ts`, `event-popup.ts`, `giving.ts`
- Create: `supabase/functions/content-data/content-data.test.ts`
- Create: `src/integrations/supabase/services/content-data-adapters.test.ts`
- Modify: `src/integrations/supabase/services/ministries.service.ts`, `events.service.ts`, `service-times.service.ts`, `church-info.service.ts`, `sermons.service.ts`, `gallery.service.ts`, `pastors.service.ts`, `event-popup.service.ts`, `giving.service.ts`

**Interfaces:**
- `content-data` accepts `{ resource, operation, input? }` and supports read operations `ministries:list`, `events:list`, `service-times:list`, `church-info:get`, `sermons:list`, `sermons:latest`, `gallery:list`, `pastors:list`, `event-popup:get`, and `giving:get`.
- Existing methods remain `getAll`, `getServiceTimes`, `getChurchInfo`, `getLatest`, `getGalleryImages`, `getSettings`, and `getGivingSettings`.

- [ ] **Step 1: Write service contract tests before changing services.**

```ts
it("lists ministries through content-data", async () => {
  const invoke = vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: [{ id: "ministry-1" }] },
    error: null,
  });

  await expect(ministriesService.getAll()).resolves.toEqual([{ id: "ministry-1" }]);
  expect(invoke).toHaveBeenCalledWith("content-data", {
    body: { resource: "ministries", operation: "list" },
  });
});
```

Add equivalent focused contract cases for event list, latest sermon, church-info singleton, event-popup fallback response, and giving settings.

- [ ] **Step 2: Run the adapter tests and confirm RED.**

Run: `npx vitest run src/integrations/supabase/services/content-data-adapters.test.ts`

Expected: FAIL because the existing services call `.from(...)` and do not invoke `content-data`.

- [ ] **Step 3: Write Edge dispatch tests before moving query code.**

Test that `{ resource: "events", operation: "list" }` calls the events resource handler and that an unknown resource/operation returns `400`. Test the public read path without requiring a user JWT.

- [ ] **Step 4: Run the Edge tests and confirm RED.**

Run: `deno test -A supabase/functions/content-data/content-data.test.ts`

Expected: FAIL because the function directory and dispatcher do not exist.

- [ ] **Step 5: Implement the dispatcher and resource queries by moving the existing clauses verbatim.**

For example, `supabase/functions/content-data/ministries.ts` must retain:

```ts
const { data, error } = await supabase
  .from("ministries")
  .select("*")
  .order("sort_order", { ascending: true });
```

The other read modules must preserve the current service clauses exactly: events ordered by ascending `event_date`; service times ordered by ascending `sort_order`; church info with `.maybeSingle()`; sermons ordered by descending `sermon_date`; latest sermon with `.limit(1).maybeSingle()`; gallery ordered by descending `created_at`; pastors ordered by ascending `sort_order`; event-popup filtered by `singleton_key` and `.single()` with the existing `PGRST116` fallback; and giving settings with `.single()`.

- [ ] **Step 6: Replace only service transport and keep return types unchanged.**

Each service method calls `invokeFunction` with its resource/operation and returns the unwrapped result. Do not change hook imports or component call sites. `useGiving.ts` will call `givingService.getGivingSettings()` after this task; its mutation remains for Task 3.

- [ ] **Step 7: Run focused tests and typecheck.**

Run: `npx vitest run src/integrations/supabase/services/content-data-adapters.test.ts`; `deno test -A supabase/functions/content-data/content-data.test.ts`; `npm run typecheck`

Expected: all content-read tests pass and TypeScript exits with code `0`.

- [ ] **Step 8: Commit the public-read extraction.**

```powershell
git add supabase/functions/content-data src/integrations/supabase/services
git commit -m "refactor: move content reads to edge functions"
```

## Task 3: Move content mutations and sorting behind `content-data`

**Files:**
- Modify: `supabase/functions/content-data/index.ts`, `ministries.ts`, `events.ts`, `service-times.ts`, `church-info.ts`, `sermons.ts`, `gallery.ts`, `pastors.ts`, `event-popup.ts`, `giving.ts`
- Create: `supabase/functions/content-data/content-mutations.test.ts`
- Create: `src/integrations/supabase/services/content-mutation-adapters.test.ts`
- Modify: `src/integrations/supabase/services/ministries.service.ts`, `events.service.ts`, `service-times.service.ts`, `church-info.service.ts`, `sermons.service.ts`, `gallery.service.ts`, `pastors.service.ts`, `event-popup.service.ts`, `giving.service.ts`, `admin.service.ts`
- Modify: `src/hooks/useGiving.ts`

**Interfaces:**
- Add operations `create`, `update`, `delete`, and `sort` only for resources that already expose those methods.
- Preserve existing methods: `create`, `update`, `deleteMinistry`, `deleteEvent`, `deleteServiceTime`, `deleteSermon`, `deleteGalleryImage`, `deletePastor`, `updateSortOrder`, `upsertSettings`, and `adminService.updateGivingSettings`.

- [ ] **Step 1: Write mutation contract tests.**

```ts
it("updates an event with the existing payload shape", async () => {
  const event = { id: "event-1", title: "Updated" };
  const invoke = vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: event },
    error: null,
  });

  await expect(eventsService.update(event)).resolves.toEqual(event);
  expect(invoke).toHaveBeenCalledWith("content-data", {
    body: { resource: "events", operation: "update", input: event },
  });
});
```

Add tests for delete IDs, insert arrays/payloads, sort-order arrays, church-info update, event-popup upsert payload, and giving update payload.

- [ ] **Step 2: Run mutation tests and confirm RED.**

Run: `npx vitest run src/integrations/supabase/services/content-mutation-adapters.test.ts`

Expected: FAIL because mutation services still call frontend query builders.

- [ ] **Step 3: Write query-equivalence tests for mutation resources.**

Mock the Edge resource client boundary and assert the same method sequence and values. For example, the events update path must call `.update(updates).eq("id", id).select().single()`, and the ministry/service-time/pastor sort paths must retain the existing `Promise.all` behavior and first-error behavior.

- [ ] **Step 4: Run Edge mutation tests and confirm RED.**

Run: `deno test -A supabase/functions/content-data/content-mutations.test.ts`

Expected: FAIL before the new mutation handlers exist.

- [ ] **Step 5: Implement the mutation handlers by moving existing queries unchanged.**

Do not improve payloads or replace per-row sort updates with a bulk operation. Preserve the current update/delete/insert clauses, return IDs where current services return IDs, and preserve `.select().single()` where current services return rows.

- [ ] **Step 6: Replace frontend mutation bodies with `invokeFunction` calls.**

Keep `useChurchData.tsx` mutation callbacks, cache invalidation, and `logActivity` calls unchanged. Change only the service implementation used by those callbacks. Change `useGiving.ts` to call `givingService.getGivingSettings()` and an Edge-backed giving update method.

- [ ] **Step 7: Run focused tests, typecheck, and the content Cypress flows.**

Run: `npx vitest run src/integrations/supabase/services/content-mutation-adapters.test.ts`; `deno test -A supabase/functions/content-data/content-mutations.test.ts`; `npm run typecheck`; `npx cypress run --spec "cypress/e2e/user/index/index.cy.js,cypress/e2e/user/gallery/gallery.cy.js"`

Expected: focused tests and typecheck pass; the existing home/gallery flows complete without new failures.

- [ ] **Step 8: Commit content mutations.**

```powershell
git add supabase/functions/content-data src/integrations/supabase/services src/hooks/useGiving.ts
git commit -m "refactor: move content mutations to edge functions"
```

## Task 4: Move analytics queries while preserving browser transformations

**Files:**
- Create: `src/integrations/supabase/services/analytics.service.ts`
- Create: `src/integrations/supabase/services/analytics.service.test.ts`
- Create: `supabase/functions/analytics-data/index.ts`, `visits.ts`, `summaries.ts`, `content-counts.ts`
- Create: `supabase/functions/analytics-data/analytics-data.test.ts`
- Modify: `src/hooks/useAnalytics.ts`

**Interfaces:**
- `analyticsService.trackPageVisit(payload): Promise<void>`
- `analyticsService.getSummary(daysBack): Promise<unknown>`
- `analyticsService.getDailyVisits(daysBack): Promise<DailyVisitRow[]>`
- `analyticsService.getPagePopularity(daysBack): Promise<PagePopularityRow[]>`
- `analyticsService.getRecentVisits(limit): Promise<RecentVisitRow[]>`
- `analyticsService.getContentCounts(): Promise<ContentCountRows>`

- [ ] **Step 1: Write tests for consent/payload and each adapter call.**

```ts
it("tracks a consented page visit through analytics-data", async () => {
  const invoke = vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: null },
    error: null,
  });

  await analyticsService.trackPageVisit({
    page_path: "/events",
    visitor_id: "visitor-1",
    session_id: "session-1",
    user_agent: "test-agent",
    referrer: null,
  });

  expect(invoke).toHaveBeenCalledWith("analytics-data", {
    body: {
      resource: "visits",
      operation: "create",
      input: expect.objectContaining({ page_path: "/events" }),
    },
  });
});
```

Add pure tests that preserve daily grouping totals and page-popularity descending sort/top-10 behavior.

- [ ] **Step 2: Run the analytics tests and confirm RED.**

Run: `npx vitest run src/integrations/supabase/services/analytics.service.test.ts`

Expected: FAIL because the service and Edge function modules do not exist.

- [ ] **Step 3: Write Edge query-equivalence tests.**

Assert the exact existing clauses: `analytics_daily_stats` selects `date, total_visits, unique_visitors, page_path`, filters with the calculated ISO date, and orders `date` ascending; page popularity selects `page_path, total_visits, unique_visitors`, uses the same date filter, and orders `total_visits` descending; recent visits selects `id, page_path, visited_at, user_agent, referrer`, orders `visited_at` descending, and applies `limit`; summary calls `get_analytics_summary` with `days_back`; content counts selects ministry IDs and event IDs/statuses.

- [ ] **Step 4: Run Edge analytics tests and confirm RED.**

Run: `deno test -A supabase/functions/analytics-data/analytics-data.test.ts`

Expected: FAIL before the handlers and resource modules exist.

- [ ] **Step 5: Implement Edge analytics resources and adapters.**

Move only the database calls to Edge Functions. Keep visitor/session ID generation, consent checks, browser `user_agent`/`referrer` collection, default summary values, and daily/page aggregation in the frontend hook/service layer exactly as current behavior requires.

- [ ] **Step 6: Refactor `useAnalytics.ts` to use `analyticsService`.**

Retain query keys, retry counts, refetch intervals, silent tracking failure, and `ContentAnalytics` output. Remove its `supabase` import and all `.from(...)`/`.rpc(...)` calls.

- [ ] **Step 7: Run analytics tests and typecheck.**

Run: `npx vitest run src/integrations/supabase/services/analytics.service.test.ts`; `deno test -A supabase/functions/analytics-data/analytics-data.test.ts`; `npm run typecheck`

Expected: all analytics tests pass and TypeScript exits with code `0`.

- [ ] **Step 8: Commit analytics extraction.**

```powershell
git add src/integrations/supabase/services/analytics.service.ts src/integrations/supabase/services/analytics.service.test.ts src/hooks/useAnalytics.ts supabase/functions/analytics-data
git commit -m "refactor: move analytics queries to edge functions"
```

## Task 5: Move activity-log queries and writes behind `activity-logs`

**Files:**
- Create: `src/integrations/supabase/services/activity-logs.service.ts`
- Create: `src/integrations/supabase/services/activity-logs.service.test.ts`
- Create: `supabase/functions/activity-logs/index.ts`, `queries.ts`, `writes.ts`
- Create: `supabase/functions/activity-logs/activity-logs.test.ts`
- Modify: `src/hooks/useLogs.ts`
- Modify: `src/hooks/useChurchData.tsx` only if import paths need service wiring; preserve hook behavior and logging calls.

**Interfaces:**
- `activityLogsService.list(filters): Promise<LogsResult>`
- `activityLogsService.getSummary(): Promise<{ total: number; byActionType: Record<string, number> }>`
- `activityLogsService.clear(): Promise<void>`
- `activityLogsService.create(payload: ActivityLogInsert): Promise<void>`
- `activityLogsService.getActionTypes(): Promise<string[]>`
- `activityLogsService.getEntityTypes(): Promise<string[]>`

- [ ] **Step 1: Write tests for filters, end-of-day behavior, and logging failure semantics.**

```ts
it("serializes log filters without changing pagination", async () => {
  const invoke = vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: { logs: [], totalCount: 0 } },
    error: null,
  });

  await activityLogsService.list({ limit: 25, offset: 50, actionType: "UPDATE_EVENT" });

  expect(invoke).toHaveBeenCalledWith("activity-logs", {
    body: {
      resource: "logs",
      operation: "list",
      input: { limit: 25, offset: 50, actionType: "UPDATE_EVENT" },
    },
  });
});
```

Add tests for `startDate`, `endDate`, `entityType`, and `userId`; summary counts; unique action/entity type sorting; clear behavior; and `logActivity` swallowing failures.

- [ ] **Step 2: Run the log tests and confirm RED.**

Run: `npx vitest run src/integrations/supabase/services/activity-logs.service.test.ts`

Expected: FAIL because the service and Edge handlers do not exist.

- [ ] **Step 3: Write Edge query-equivalence tests.**

Assert that list starts with `.from("activity_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1)`, then applies the existing optional filters, including an end date normalized to `23:59:59.999`. Assert the existing clear predicate `.delete().neq("id", "00000000-0000-0000-0000-000000000000")`, insert payload, and distinct-value queries.

- [ ] **Step 4: Run Edge log tests and confirm RED.**

Run: `deno test -A supabase/functions/activity-logs/activity-logs.test.ts`

Expected: FAIL before the resource modules exist.

- [ ] **Step 5: Implement the Edge resource modules and service adapters.**

Keep server-side query construction in `queries.ts`/`writes.ts`; keep client-side date objects and browser metadata serialization in the adapter. Preserve the current `useLogs` query keys, intervals, `LogsResult`, `useClearLogs` state transitions, and silent `logActivity` failure behavior.

- [ ] **Step 6: Remove all direct activity-log queries from `useLogs.ts`.**

The hook should call service methods only. It must not import the Supabase client.

- [ ] **Step 7: Run focused tests and typecheck.**

Run: `npx vitest run src/integrations/supabase/services/activity-logs.service.test.ts`; `deno test -A supabase/functions/activity-logs/activity-logs.test.ts`; `npm run typecheck`

Expected: all focused log tests pass and TypeScript exits with code `0`.

- [ ] **Step 8: Commit activity-log extraction.**

```powershell
git add src/integrations/supabase/services/activity-logs.service.ts src/integrations/supabase/services/activity-logs.service.test.ts src/hooks/useLogs.ts supabase/functions/activity-logs
git commit -m "refactor: move activity log queries to edge functions"
```

## Task 6: Move profile, role, allowed-tab, and admin user queries behind `user-management`

**Files:**
- Create: `supabase/functions/user-management/index.ts`, `profiles.ts`, `roles.ts`, `allowed-tabs.ts`
- Create: `supabase/functions/user-management/user-management.test.ts`
- Create: `src/integrations/supabase/services/user-management-adapters.test.ts`
- Modify: `src/integrations/supabase/services/admin.service.ts`, `auth.service.ts`, `profiles.service.ts`, `users.service.ts`
- Create: `supabase/functions/create-user/create-user.test.ts`
- Modify: `src/hooks/useAuth.tsx` only if it contains direct query access after service conversion.

**Interfaces:**
- `adminService.getAllUsersWithRoles(): Promise<AdminUserProfile[]>`
- `adminService.updateUserProfile(userId, fullName): Promise<void>`
- `adminService.updateGivingSettings(id, updates): Promise<void>` remains the same API but invokes `content-data` giving update.
- `authService.getUserRole(userId): Promise<UserRole>` and `authService.getAllowedTabs(): Promise<string[]>` remain unchanged.
- `profileService.getProfile(userId)`, `profileService.updateProfile(params)`, and native `profileService.updatePassword(newPassword)` remain unchanged.
- `usersService.createUserRole`, `deleteUserRole`, `updateUserRole`, and `deleteUser` remain unchanged.

- [ ] **Step 1: Write adapter tests before changing the user services.**

```ts
it("deletes a user through the unchanged RPC contract on user-management", async () => {
  const invoke = vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
    data: { data: null },
    error: null,
  });

  await usersService.deleteUser({ target_user_id: "user-1" });

  expect(invoke).toHaveBeenCalledWith("user-management", {
    body: {
      resource: "users",
      operation: "delete",
      input: { target_user_id: "user-1" },
    },
  });
});
```

Add tests for profile read/upsert, role insert/delete/update, admin profile/role merge output, `getUserRole` fallback to `null`, and `getAllowedTabs` fallback to `["profile"]`.

- [ ] **Step 2: Run user adapter tests and confirm RED.**

Run: `npx vitest run src/integrations/supabase/services/user-management-adapters.test.ts`

Expected: FAIL because the current services still query profiles, roles, and RPCs directly.

- [ ] **Step 3: Write Edge auth/authorization tests.**

Assert that protected operations reject missing/invalid JWTs, admin-only operations reject non-admin callers, and the allowed-tabs operation preserves the existing `get_allowed_tabs` RPC call and fallback. Assert that user deletion preserves the existing `delete_user` RPC argument `target_user_id`.

- [ ] **Step 4: Run Edge user tests and confirm RED.**

Run: `deno test -A supabase/functions/user-management/user-management.test.ts`

Expected: FAIL before the function and role gates exist.

- [ ] **Step 5: Implement resource modules with the existing queries unchanged.**

Move the two profile/role list queries and the existing frontend merge into `profiles.ts`/`roles.ts` or a user-list resource so `getAllUsersWithRoles()` still returns `AdminUserProfile[]` sorted by the same `created_at` rule. Preserve `.select("*")`, `.select("role")`, `.eq("user_id", userId)`, `.maybeSingle()`, the `get_allowed_tabs` RPC, the profile `.upsert` payload including `updated_at`, role delete-then-insert order, and `delete_user(target_user_id: ...)`.

- [ ] **Step 6: Convert services to function adapters and leave Auth/Storage native.**

Remove query-builder imports/calls from the four service files. Keep `profileService.updatePassword()` on `supabase.auth.updateUser()` and keep `AdminUsers` calling the existing `create-user` function. Add tests for `create-user` admin authorization, service-role user creation, and role-assignment warning without changing its current queries.

- [ ] **Step 7: Run user tests, typecheck, and admin Cypress flows.**

Run: `npx vitest run src/integrations/supabase/services/user-management-adapters.test.ts`; `deno test -A supabase/functions/user-management/user-management.test.ts supabase/functions/create-user/create-user.test.ts`; `npm run typecheck`; `npx cypress run --spec "cypress/e2e/admin/admincheck.cy.js,cypress/e2e/admin/adduserasadmin.cy.js"`

Expected: all focused tests and typecheck pass; admin authentication and user-management flows complete without new failures.

- [ ] **Step 8: Commit user-management extraction.**

```powershell
git add supabase/functions/user-management supabase/functions/create-user src/integrations/supabase/services src/hooks/useAuth.tsx
git commit -m "refactor: move user data queries to edge functions"
```

## Task 7: Enforce the no-frontend-query boundary and update documentation

**Files:**
- Create: `scripts/verify-no-frontend-db-queries.mjs`
- Create: `scripts/verify-no-frontend-db-queries.test.mjs` or a Vitest test for the guard
- Modify: `package.json`
- Modify: `documentations/ARCHITECTURE.md`, `documentations/API.md`, `documentations/DEVELOPMENT.md`

**Interfaces:**
- `node scripts/verify-no-frontend-db-queries.mjs` exits `0` when `src/` has no table `.from(...)` or `.rpc(...)` calls and exits `1` with file/line details when it finds one.

- [ ] **Step 1: Write the failing architecture-guard test.**

Use a temporary fixture containing `supabase.from("events")`, `supabase.rpc("get_allowed_tabs")`, and `supabase.storage.from("gallery")`; assert only the first two are reported.

- [ ] **Step 2: Run the guard test and confirm RED.**

Run: `npx vitest run scripts/verify-no-frontend-db-queries.test.mjs`

Expected: FAIL because the guard does not exist.

- [ ] **Step 3: Implement the guard with explicit Storage allowance.**

```js
const DATABASE_QUERY = /\.from\s*\(|\.rpc\s*\(/;
const STORAGE_QUERY = /supabase\.storage\.from\s*\(/;

function isForbidden(line) {
  return DATABASE_QUERY.test(line) && !STORAGE_QUERY.test(line);
}
```

Walk only `src/`, report every forbidden file and line, and exit non-zero when any match exists. Add `"test:architecture": "node scripts/verify-no-frontend-db-queries.mjs"` and run it as part of the normal verification commands.

- [ ] **Step 4: Run the guard against the migrated source.**

Run: `npm run test:architecture`

Expected: PASS with no frontend database-query violations. If it reports a real table/RPC call, move that call before proceeding; do not whitelist it.

- [ ] **Step 5: Update documentation.**

Document the service → `supabase.functions.invoke` → resource-query-module path, function domains, local Deno/Vitest commands, authorization expectations, and the rule that Auth/Storage/Realtime are native exceptions while table queries/RPCs are Edge-only.

- [ ] **Step 6: Commit the architectural guard and docs.**

```powershell
git add scripts package.json documentations/ARCHITECTURE.md documentations/API.md documentations/DEVELOPMENT.md
git commit -m "chore: enforce edge-only frontend database access"
```

## Task 8: Full verification and handoff

**Files:**
- No planned production-file changes; inspect the complete diff and test output.

- [ ] **Step 1: Run the full frontend unit suite.**

Run: `npm test`

Expected: Vitest exits `0` with no failed tests.

- [ ] **Step 2: Run all Edge Function tests.**

Run: `deno test -A supabase/functions`

Expected: Deno exits `0` with no failed tests.

- [ ] **Step 3: Run architecture, type, lint, and production-build checks.**

Run: `npm run test:architecture`; `npm run typecheck`; `npm exec -- ultracite check`; `npm run build`

Expected: every command exits `0`; no service-role key is emitted in the built frontend assets.

- [ ] **Step 4: Run all existing Cypress regression flows.**

Run: `npx cypress run`

Expected: existing authentication, admin, home-page, and gallery suites pass or any pre-existing failures are documented with their baseline evidence.

- [ ] **Step 5: Inspect the final diff and query inventory.**

Run: `git diff --check`; `rg -n --glob '*.ts' --glob '*.tsx' --glob '*.js' '\.from\(|\.rpc\(' src`; `git status --short`

Expected: no whitespace errors; the only frontend `.from(...)` matches are explicitly allowed `supabase.storage.from(...)` calls; no unexpected files are modified.

- [ ] **Step 6: Commit only after fresh verification evidence.**

```powershell
git status --short
git log -8 --oneline
```

Create the final task commit only after all required commands above have passed and the diff contains no query changes outside Edge Functions.

