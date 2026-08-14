# Frontend Database Query Extraction Design

## Goal

Move every frontend database table query and RPC call behind Supabase Edge Functions while preserving the existing service method APIs, query behavior, and application responses. Refactor the service and hook boundaries so query code is grouped by business domain and resource, and introduce TDD coverage before each migration step.

## Scope

### In scope

- Remove database query builders from `src/`.
- Preserve the public methods in `src/integrations/supabase/services/` so hooks and components remain stable.
- Add domain-oriented Supabase Edge Functions under `supabase/functions/`.
- Move existing table queries and RPC calls without changing their table names, selected columns, filters, ordering, pagination, RPC names, or fallback behavior.
- Add automated frontend and Edge Function tests using a red-green-refactor workflow.
- Keep the existing `create-user` Edge Function behavior while bringing its organization and tests into the same structure.

### Out of scope

- Rewriting SQL or changing database migrations.
- Changing RLS policies, authorization rules, schema, or response semantics unless a test exposes an existing defect that blocks the extraction.
- Moving Supabase Auth methods, Storage operations, or Realtime subscriptions. These are native service APIs rather than frontend database queries.
- Replacing the existing query/cache hook implementation.
- Unrelated UI, styling, routing, or performance changes.

## Current context

The repository already has a partial service layer in `src/integrations/supabase/services/`, and `supabase/functions/create-user/index.ts` already handles privileged user creation. Most content queries are isolated by resource in services, but those services still call the browser Supabase client directly. Remaining direct table/RPC access also exists in analytics, logs, giving settings, authentication-role lookup, profile/admin services, and user-role services.

The current frontend-facing service methods are the compatibility boundary. Examples include `ministriesService.getAll()`, `eventsService.create()`, `serviceTimesService.updateSortOrder()`, `profileService.getProfile()`, and `usersService.deleteUser()`.

## Architecture

The browser data path will become:

```text
React component or hook
        |
        v
Existing frontend service method
        |
        v
supabase.functions.invoke(domain-function, request)
        |
        v
Edge Function authentication, validation, dispatch
        |
        v
Resource query module
        |
        v
Existing Supabase table query or RPC
```

Frontend services remain small adapters. They are responsible for invoking the named function, passing typed input, unwrapping the stable response, and translating invocation errors into the errors currently expected by hooks and components. They must not import or call a query builder.

Each Edge Function has a thin `index.ts` entry point and resource modules grouped by business capability. The entry point handles CORS, request parsing, authentication context, authorization, dispatch, and response formatting. Resource modules own the complete behavior for one resource, including reads, mutations, sorting, filtering, and resource-specific fallbacks.

## Edge Function and resource boundaries

```text
supabase/functions/
  _shared/
    auth.ts
    cors.ts
    errors.ts
    responses.ts
    types.ts

  content-data/
    index.ts
    ministries.ts
    events.ts
    service-times.ts
    church-info.ts
    sermons.ts
    gallery.ts
    pastors.ts
    event-popup.ts
    giving.ts

  analytics-data/
    index.ts
    visits.ts
    summaries.ts
    content-counts.ts

  activity-logs/
    index.ts
    queries.ts
    writes.ts

  user-management/
    index.ts
    profiles.ts
    roles.ts
    allowed-tabs.ts

  create-user/
    index.ts
```

The grouping rule is:

```text
business domain -> resource -> operation
```

Resources that change together remain together. Authorization boundaries remain separate: public content, analytics, activity logs, and user management do not share a broad catch-all function. The existing `create-user` function remains separate because it uses the privileged Supabase Auth Admin API and has a distinct security boundary.

## Request and response contract

Domain functions use a small operation envelope:

```ts
type FunctionRequest = {
  resource: string;
  operation: string;
  input?: unknown;
};
```

The exact resource and operation names will be defined from the existing service methods, for example:

```ts
{ resource: "events", operation: "list" }
{ resource: "events", operation: "create", input: event }
{ resource: "events", operation: "update", input: { id, ...updates } }
{ resource: "events", operation: "delete", input: { id } }
```

Successful responses use a consistent data envelope, and errors use a consistent message/status envelope. The frontend adapter unwraps this envelope so existing hooks receive the same values they receive today. Resource-specific fallback behavior, such as the event-popup default when no singleton row exists, remains in the resource module.

## Authorization and secrets

- Anonymous public reads continue to work through the content function.
- Authenticated calls carry the caller session JWT through `supabase.functions.invoke`.
- Edge Functions validate the caller before protected operations.
- RLS-scoped clients are used for operations that should execute under the caller’s database permissions.
- Service-role access is limited to operations that already require elevated privileges, principally `create-user` and any user-management operation that cannot be safely performed through RLS.
- Service-role credentials are never imported, bundled, or exposed in `src/`.
- Frontend Auth APIs remain in the existing auth service, but role and allowed-tab table/RPC lookups move to `user-management`.

## Query-preservation rule

The extraction is a transport refactor, not a query rewrite. For every moved query, the implementation must preserve:

- table name;
- selected columns, including `*` versus explicit selections;
- insert, update, upsert, and delete payload shape;
- filters and filter values;
- ordering and ascending/descending direction;
- range, limit, and singleton behavior;
- RPC name and argument names;
- error handling and documented fallback behavior;
- returned data shape consumed by the current service method.

No frontend file may contain `.from(...)` or `.rpc(...)` after migration. Storage calls such as `supabase.storage.from(...)` are not database queries and remain in the storage service.

## TDD strategy

The project currently has Cypress coverage but no unit-test runner. Add unit testing in two layers:

### Frontend tests

Use Vitest for frontend service adapters and pure transformations. Tests cover:

- the service invokes the expected Edge Function and operation;
- inputs are serialized without mutation;
- successful envelopes unwrap to the current service return type;
- function errors are propagated consistently;
- analytics grouping, sorting, limiting, and log summaries retain current behavior;
- a static architecture guard fails if database query builders are introduced into `src/`.

### Edge Function tests

Use Deno tests in the Supabase function tree. Tests cover:

- OPTIONS/CORS behavior;
- anonymous versus authenticated access;
- role restrictions for admin/moderator operations;
- invalid operation and invalid input responses;
- dispatch to the correct resource module;
- resource-module query equivalence using mocked Supabase clients or mocked fetch boundaries;
- preservation of resource-specific fallbacks and returned shapes.

Each migration unit follows this sequence:

1. Write one focused failing contract test.
2. Run it and confirm it fails for the missing Edge transport or boundary.
3. Implement the smallest adapter/function extraction.
4. Run the focused test until green.
5. Run the full unit suite, typecheck, lint/Ultracite, build, and relevant Cypress flows.
6. Refactor names and file boundaries only while all tests remain green.

Existing Cypress tests remain the browser-level regression suite for authentication, admin access, user management, gallery, and critical public-page loading.

## Migration order

1. Add shared Edge Function response, error, request, and auth helpers plus the frontend function-invocation adapter.
2. Migrate public content resources and giving/event-popup reads first, preserving existing service APIs.
3. Migrate content mutations and sort-order operations.
4. Migrate analytics tracking and dashboard reads, keeping existing client-side aggregation behavior until equivalence is proven.
5. Migrate activity-log reads, writes, summaries, filters, and clearing.
6. Migrate profile, role, allowed-tab, and admin user operations; keep `create-user` as the privileged auth boundary.
7. Remove direct database imports/query builders from frontend services and hooks.
8. Add the static no-frontend-query guard and update architecture/development documentation.

Each step must leave the application buildable and independently testable. No migration step changes database migrations or query semantics.

## Acceptance criteria

- `rg`/the architecture guard finds no frontend `.from(...)` or `.rpc(...)` calls outside explicitly allowed Storage APIs.
- Existing frontend service method names and hook-facing return values remain compatible.
- All moved table and RPC access runs inside Supabase Edge Functions grouped by domain and resource.
- No service-role key is present in frontend code or client bundles.
- Unit tests demonstrate red-green TDD cycles for each migration unit.
- Existing Cypress flows continue to cover and pass the affected user journeys.
- Typecheck, Ultracite, production build, frontend unit tests, and Edge Function tests pass before completion.

