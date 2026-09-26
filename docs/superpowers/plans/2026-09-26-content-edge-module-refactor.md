# Content Edge Module Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `content-data` Supabase Edge Function into a MeatLens-style `content` module with private resource submodules while preserving every existing request, response, query, and deployed function name.

**Architecture:** `supabase/functions/content-data/index.ts` remains the deployment adapter. It delegates to `functions/modules/content/index.ts`, which composes private submodules for sermons, events, ministries, church-info, gallery, pastors, service-times, giving, and event-popup. Each submodule owns its domain ports, application use cases, Supabase infrastructure, presentation controller, and tests; no parent layer directories or placeholder files are created when a layer has no source files.

**Tech Stack:** Deno, TypeScript, Supabase Edge Functions, `@supabase/supabase-js`, PostgreSQL-backed RLS, Deno test, existing `{ data: ... }` / `{ error: ... }` response envelopes, Markdown documentation.

## Global Constraints

- Each change must remain within the `content` module; `analytics`, `identity`, `audit`, and `livestream` are separate future migrations.
- Private resource submodules may be created under `functions/modules/content/`, but external code may import only `functions/modules/content/index.ts`.
- Domain code has no Deno, HTTP, environment, Supabase, or database-query imports.
- Application use-case classes expose exactly one public `execute` method.
- Presentation code does not call `.from()` or `.rpc()`.
- Supabase repositories, external adapters, service-role construction, and secret reads stay in infrastructure/runtime boundaries.
- Existing deployed function names, request shapes, response envelopes, authorization behavior, database behavior, and frontend contracts remain unchanged.
- Do not create empty directories or add `.gitkeep` files.
- Every affected documentation file must describe only paths that actually exist.
- Use TDD: every production file is preceded by a failing test and a focused verification command.
- Do not use focused, skipped, weakened, or swallowed tests.

---

## File map before implementation

The current implementation to migrate is under `supabase/functions/content-data/`:

- `index.ts`: request parsing, client construction, dispatch, and function bootstrapping.
- `resource-columns.ts`: all resource-specific projection strings and the public row limit.
- `church-info.ts`, `events.ts`, `event-popup.ts`, `gallery.ts`, `giving.ts`, `ministries.ts`, `pastors.ts`, `sermons.ts`, `service-times.ts`: direct Supabase handler factories.
- `content-data.test.ts`: dispatcher behavior.
- `content-mutations.test.ts`: mutation query contracts.
- `resource-queries.test.ts`: read query contracts.
- `content-index-migration.test.ts`: content index migration contract.

The target module contains only directories that receive files:

```text
supabase/functions/modules/content/
  sermons/{domain/ports,application,infrastructure,presentation}/
  events/{domain/ports,application,infrastructure,presentation}/
  ministries/{domain/ports,application,infrastructure,presentation}/
  church-info/{domain/ports,application,infrastructure,presentation}/
  gallery/{domain/ports,application,infrastructure,presentation}/
  pastors/{domain/ports,application,infrastructure,presentation}/
  service-times/{domain/ports,application,infrastructure,presentation}/
  giving/{domain/ports,application,infrastructure,presentation}/
  event-popup/{domain/ports,application,infrastructure,presentation}/
  index.ts
```

The brace notation is illustrative only; create a directory only when a file
listed by a task needs it. Never create an empty layer directory.

## Task 1: Add architecture boundary tests

**Files:**
- Create: `supabase/functions/tests/architecture/content-module-boundaries.test.ts`

**Interfaces:**
- Produces architecture checks that later content submodules must satisfy.

- [ ] **Step 1: Write the failing architecture test**

Resolve `../../modules/content` relative to the test file and assert that
`content/index.ts` and the nine resource directories exist after
implementation. Do not require a layer directory when it has no source file.
Recursively scan existing TypeScript files and report violations of these
rules:

```ts
const forbiddenInDomain = /@supabase\/supabase-js|\bDeno\b|\.from\(|\.rpc\(/;
const forbiddenInApplication = /@supabase\/supabase-js|\bDeno\b|\.from\(|\.rpc\(/;
const forbiddenInPresentation = /@supabase\/supabase-js|\.from\(|\.rpc\(/;
const placeholderName = /(^|[\\/])\.gitkeep$/;
```

Also assert that every application class has exactly one public method named
`execute`, and that `content-data/index.ts` imports the content composition
surface but not a private resource path.

- [ ] **Step 2: Run the test and verify the expected failure**

```powershell
deno test -A supabase/functions/tests/architecture/content-module-boundaries.test.ts
```

Expected result: FAIL because `functions/modules/content` does not yet exist.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add supabase/functions/tests/architecture/content-module-boundaries.test.ts
git commit -m "test: define content module boundaries"
```

## Task 2: Add the request-scoped composition adapter

**Files:**
- Create: `supabase/functions/_shared/infrastructure/supabase/request-client.ts`
- Create: `supabase/functions/_shared/infrastructure/supabase/request-client.test.ts`
- Create: `supabase/functions/modules/content/index.ts`

**Interfaces:**
- `createRequestSupabaseClient(request: Request, env?: EnvironmentReader): SupabaseClient`
- `EnvironmentReader.get(name: string): string | undefined`
- `createContentModule(client: SupabaseClient): ContentRoutes`
- `ContentRoutes = Record<string, Record<string, ContentHandler>>`

- [ ] **Step 1: Write the failing request-client test**

Test that the factory forwards `Authorization`, uses `SUPABASE_URL` and
`SUPABASE_ANON_KEY`, and throws the existing configuration error when either
value is missing. Inject an `EnvironmentReader`; do not use real environment
values in the test.

- [ ] **Step 2: Run the focused test and verify failure**

```powershell
deno test -A supabase/functions/_shared/infrastructure/supabase/request-client.test.ts
```

Expected result: FAIL because the request-client module does not exist.

- [ ] **Step 3: Implement the minimal adapter**

Use the current client behavior exactly:

```ts
export interface EnvironmentReader {
  get(name: string): string | undefined;
}

export function createRequestSupabaseClient(
  request: Request,
  env: EnvironmentReader = Deno.env,
): SupabaseClient {
  const url = env.get("SUPABASE_URL");
  const anonKey = env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    throw new Error("Supabase function environment is not configured");
  }

  const authorization = request.headers.get("Authorization");
  return createClient(url, anonKey, {
    global: authorization ? { headers: { Authorization: authorization } } : {},
  });
}
```

Create `modules/content/index.ts` as the only public composition surface. It
may initially return an empty route map until the first resource is migrated;
do not add speculative exports or empty layer directories.

- [ ] **Step 4: Run focused tests and commit**

```powershell
deno test -A supabase/functions/_shared/infrastructure/supabase/request-client.test.ts
git add supabase/functions/_shared/infrastructure/supabase/request-client.ts supabase/functions/_shared/infrastructure/supabase/request-client.test.ts supabase/functions/modules/content/index.ts
git commit -m "feat: add content module composition boundary"
```

## Task 3: Migrate the sermons submodule

**Files:**
- Create: `supabase/functions/modules/content/sermons/domain/ports/SermonRepository.ts`
- Create: `supabase/functions/modules/content/sermons/application/ListSermons.ts`
- Create: `supabase/functions/modules/content/sermons/application/GetLatestSermon.ts`
- Create: `supabase/functions/modules/content/sermons/application/CreateSermon.ts`
- Create: `supabase/functions/modules/content/sermons/application/UpdateSermon.ts`
- Create: `supabase/functions/modules/content/sermons/application/DeleteSermon.ts`
- Create: `supabase/functions/modules/content/sermons/application/sermons.test.ts`
- Create: `supabase/functions/modules/content/sermons/infrastructure/SupabaseSermonRepository.ts`
- Create: `supabase/functions/modules/content/sermons/infrastructure/sermon-columns.ts`
- Create: `supabase/functions/modules/content/sermons/infrastructure/SupabaseSermonRepository.test.ts`
- Create: `supabase/functions/modules/content/sermons/presentation/SermonController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/sermons.ts`

**Interfaces:**
- Repository methods: `list(): Promise<unknown[]>`, `latest(): Promise<unknown | null>`, `create(input: unknown): Promise<unknown>`, `update(input: { id: string } & Record<string, unknown>): Promise<unknown>`, `delete(input: { id: string }): Promise<string>`.
- Use cases: `ListSermons`, `GetLatestSermon`, `CreateSermon`, `UpdateSermon`, `DeleteSermon`; each constructor accepts only `SermonRepository` and each class exposes only `execute`.
- Controller methods: `list`, `latest`, `create`, `update`, and `delete` delegate to use cases.

- [ ] **Step 1: Write failing use-case tests**

Use an in-memory fake `SermonRepository` and assert each use case forwards
inputs and returns repository results. Cover an empty list and a missing latest
sermon. Do not import Supabase in these tests.

- [ ] **Step 2: Run the tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/sermons/application/sermons.test.ts
```

Expected result: FAIL because the port and use cases do not exist.

- [ ] **Step 3: Implement the port and use cases**

Implement the five classes with one public `execute` method each. They must
contain no Deno, HTTP, Supabase, or query-builder imports.

- [ ] **Step 4: Run the use-case tests and verify green**

```powershell
deno test -A supabase/functions/modules/content/sermons/application/sermons.test.ts
```

Expected result: PASS.

- [ ] **Step 5: Write failing repository contract tests**

Move the existing sermon assertions from `content-data/resource-queries.test.ts`
and `content-data/content-mutations.test.ts` into
`SupabaseSermonRepository.test.ts`. Preserve the exact projection, descending
`sermon_date` then `id` ordering, public limit, latest limit, insert, update,
and delete call sequences.

- [ ] **Step 6: Run repository tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/sermons/infrastructure/SupabaseSermonRepository.test.ts
```

Expected result: FAIL because the repository does not exist.

- [ ] **Step 7: Implement the repository and controller**

Move the current behavior from `content-data/sermons.ts` into
`SupabaseSermonRepository`; place its projection and limit in
`sermon-columns.ts`. Only this repository may call `.from("sermons")`.
Implement `SermonController` as the presentation adapter around the five use
cases.

- [ ] **Step 8: Register the submodule**

`createContentModule(client)` must register exactly:

```ts
sermons: {
  list: (input) => controller.list(input),
  latest: (input) => controller.latest(input),
  create: (input) => controller.create(input),
  update: (input) => controller.update(input),
  delete: (input) => controller.delete(input),
}
```

- [ ] **Step 9: Run and commit**

```powershell
deno test -A supabase/functions/modules/content/sermons supabase/functions/modules/content/index.ts
git add supabase/functions/modules/content/sermons supabase/functions/modules/content/index.ts supabase/functions/content-data/sermons.ts
git commit -m "refactor: move sermons into content submodule"
```

Expected result: all sermons tests pass and the old handler file is deleted.

## Task 4: Migrate the events submodule

**Files:**
- Create: `supabase/functions/modules/content/events/domain/ports/EventRepository.ts`
- Create: `supabase/functions/modules/content/events/application/ListEvents.ts`
- Create: `supabase/functions/modules/content/events/application/CreateEvent.ts`
- Create: `supabase/functions/modules/content/events/application/UpdateEvent.ts`
- Create: `supabase/functions/modules/content/events/application/DeleteEvent.ts`
- Create: `supabase/functions/modules/content/events/application/events.test.ts`
- Create: `supabase/functions/modules/content/events/infrastructure/SupabaseEventRepository.ts`
- Create: `supabase/functions/modules/content/events/infrastructure/event-columns.ts`
- Create: `supabase/functions/modules/content/events/infrastructure/SupabaseEventRepository.test.ts`
- Create: `supabase/functions/modules/content/events/presentation/EventController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/events.ts`

**Interfaces:**
- Repository methods: `list`, `create`, `update`, and `delete` with the existing input and result shapes.
- Use cases: `ListEvents`, `CreateEvent`, `UpdateEvent`, and `DeleteEvent`, each with one public `execute` method.
- Controller methods: `list`, `create`, `update`, and `delete`.

- [ ] **Step 1: Write failing use-case tests**

Use a fake `EventRepository` to cover list, create, update, and delete input
forwarding, including the returned deleted ID.

- [ ] **Step 2: Run the tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/events/application/events.test.ts
```

Expected result: FAIL because the events submodule does not exist.

- [ ] **Step 3: Implement and preserve repository behavior**

Preserve the current `events` projection, ascending `event_date` then
ascending `id` ordering, 100-row limit, insert/update/delete payloads, and
single-row result behavior. Only `SupabaseEventRepository` may access the
Supabase client.

- [ ] **Step 4: Register, run, and commit**

```powershell
deno test -A supabase/functions/modules/content/events
git add supabase/functions/modules/content/events supabase/functions/modules/content/index.ts supabase/functions/content-data/events.ts
git commit -m "refactor: move events into content submodule"
```

## Task 5: Migrate the ministries submodule

**Files:**
- Create: `supabase/functions/modules/content/ministries/domain/ports/MinistryRepository.ts`
- Create: `supabase/functions/modules/content/ministries/application/ListMinistries.ts`
- Create: `supabase/functions/modules/content/ministries/application/CreateMinistry.ts`
- Create: `supabase/functions/modules/content/ministries/application/UpdateMinistry.ts`
- Create: `supabase/functions/modules/content/ministries/application/DeleteMinistry.ts`
- Create: `supabase/functions/modules/content/ministries/application/SortMinistries.ts`
- Create: `supabase/functions/modules/content/ministries/application/ministries.test.ts`
- Create: `supabase/functions/modules/content/ministries/infrastructure/SupabaseMinistryRepository.ts`
- Create: `supabase/functions/modules/content/ministries/infrastructure/ministry-columns.ts`
- Create: `supabase/functions/modules/content/ministries/infrastructure/SupabaseMinistryRepository.test.ts`
- Create: `supabase/functions/modules/content/ministries/presentation/MinistryController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/ministries.ts`

**Interfaces:**
- Use cases: `ListMinistries`, `CreateMinistry`, `UpdateMinistry`, `DeleteMinistry`, and `SortMinistries`, each with `execute` only.
- `SortMinistries.execute(items: Array<{ id: string; sort_order: number }>): Promise<Array<{ id: string; sort_order: number }>>`.

- [ ] **Step 1: Write failing use-case and sort tests**

Use a fake repository. Assert that sort receives the complete item array and
returns it unchanged after the repository completes; also test empty sort input.

- [ ] **Step 2: Run the tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/ministries/application/ministries.test.ts
```

Expected result: FAIL because the ministries submodule does not exist.

- [ ] **Step 3: Implement and preserve repository behavior**

Preserve the current projection, ascending `sort_order` then `id` ordering,
100-row limit, mutation payloads, and per-row sort updates. Use a `for...of`
loop for sequential updates so one failed update stops the operation
deterministically.

- [ ] **Step 4: Register, run, and commit**

```powershell
deno test -A supabase/functions/modules/content/ministries
git add supabase/functions/modules/content/ministries supabase/functions/modules/content/index.ts supabase/functions/content-data/ministries.ts
git commit -m "refactor: move ministries into content submodule"
```

## Task 6: Migrate the service-times submodule

**Files:**
- Create: `supabase/functions/modules/content/service-times/domain/ports/ServiceTimeRepository.ts`
- Create: `supabase/functions/modules/content/service-times/application/ListServiceTimes.ts`
- Create: `supabase/functions/modules/content/service-times/application/CreateServiceTime.ts`
- Create: `supabase/functions/modules/content/service-times/application/UpdateServiceTime.ts`
- Create: `supabase/functions/modules/content/service-times/application/DeleteServiceTime.ts`
- Create: `supabase/functions/modules/content/service-times/application/SortServiceTimes.ts`
- Create: `supabase/functions/modules/content/service-times/application/service-times.test.ts`
- Create: `supabase/functions/modules/content/service-times/infrastructure/SupabaseServiceTimeRepository.ts`
- Create: `supabase/functions/modules/content/service-times/infrastructure/service-time-columns.ts`
- Create: `supabase/functions/modules/content/service-times/infrastructure/SupabaseServiceTimeRepository.test.ts`
- Create: `supabase/functions/modules/content/service-times/presentation/ServiceTimeController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/service-times.ts`

**Interfaces:**
- Use cases: `ListServiceTimes`, `CreateServiceTime`, `UpdateServiceTime`, `DeleteServiceTime`, and `SortServiceTimes`, each with one `execute` method.
- Sort input/output: `Array<{ id: string; sort_order: number }>`.

- [ ] **Step 1: Write failing use-case tests**

Cover list, create, update, delete, sort forwarding, and empty sort behavior
with an in-memory fake repository.

- [ ] **Step 2: Run the tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/service-times/application/service-times.test.ts
```

Expected result: FAIL because the service-times submodule does not exist.

- [ ] **Step 3: Implement exact repository contracts**

Preserve the current projection, ascending `sort_order` then `id` ordering,
100-row limit, mutation payloads, and per-row sort update behavior. Keep all
Supabase calls in `SupabaseServiceTimeRepository`.

- [ ] **Step 4: Register, run, and commit**

```powershell
deno test -A supabase/functions/modules/content/service-times
git add supabase/functions/modules/content/service-times supabase/functions/modules/content/index.ts supabase/functions/content-data/service-times.ts
git commit -m "refactor: move service times into content submodule"
```

## Task 7: Migrate the church-info, gallery, and pastors submodules

**Files:**
- Create: `supabase/functions/modules/content/church-info/domain/ports/ChurchInfoRepository.ts`
- Create: `supabase/functions/modules/content/church-info/application/GetChurchInfo.ts`
- Create: `supabase/functions/modules/content/church-info/application/church-info.test.ts`
- Create: `supabase/functions/modules/content/church-info/infrastructure/SupabaseChurchInfoRepository.ts`
- Create: `supabase/functions/modules/content/church-info/infrastructure/church-info-columns.ts`
- Create: `supabase/functions/modules/content/church-info/infrastructure/SupabaseChurchInfoRepository.test.ts`
- Create: `supabase/functions/modules/content/church-info/presentation/ChurchInfoController.ts`
- Create: `supabase/functions/modules/content/gallery/domain/ports/GalleryRepository.ts`
- Create: `supabase/functions/modules/content/gallery/application/ListGalleryImages.ts`
- Create: `supabase/functions/modules/content/gallery/application/CreateGalleryImage.ts`
- Create: `supabase/functions/modules/content/gallery/application/DeleteGalleryImage.ts`
- Create: `supabase/functions/modules/content/gallery/application/gallery.test.ts`
- Create: `supabase/functions/modules/content/gallery/infrastructure/SupabaseGalleryRepository.ts`
- Create: `supabase/functions/modules/content/gallery/infrastructure/gallery-columns.ts`
- Create: `supabase/functions/modules/content/gallery/infrastructure/SupabaseGalleryRepository.test.ts`
- Create: `supabase/functions/modules/content/gallery/presentation/GalleryController.ts`
- Create: `supabase/functions/modules/content/pastors/domain/ports/PastorRepository.ts`
- Create: `supabase/functions/modules/content/pastors/application/ListPastors.ts`
- Create: `supabase/functions/modules/content/pastors/application/CreatePastor.ts`
- Create: `supabase/functions/modules/content/pastors/application/UpdatePastor.ts`
- Create: `supabase/functions/modules/content/pastors/application/DeletePastor.ts`
- Create: `supabase/functions/modules/content/pastors/application/SortPastors.ts`
- Create: `supabase/functions/modules/content/pastors/application/pastors.test.ts`
- Create: `supabase/functions/modules/content/pastors/infrastructure/SupabasePastorRepository.ts`
- Create: `supabase/functions/modules/content/pastors/infrastructure/pastor-columns.ts`
- Create: `supabase/functions/modules/content/pastors/infrastructure/SupabasePastorRepository.test.ts`
- Create: `supabase/functions/modules/content/pastors/presentation/PastorController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/church-info.ts`
- Delete after migration: `supabase/functions/content-data/gallery.ts`
- Delete after migration: `supabase/functions/content-data/pastors.ts`

**Interfaces:**
- `GetChurchInfo.execute(): Promise<unknown | null>`.
- Gallery use cases: `ListGalleryImages`, `CreateGalleryImage`, and `DeleteGalleryImage`.
- Pastor use cases: `ListPastors`, `CreatePastor`, `UpdatePastor`, `DeletePastor`, and `SortPastors`.
- Every use case has one public `execute` method and depends only on its submodule port.

- [ ] **Step 1: Write failing use-case and repository tests**

Cover church-info `maybeSingle`, gallery ordering/limit and mutations, and
pastor ordering/limit, mutations, and per-row sort updates. Preserve the exact
query call sequences from the current `resource-queries.test.ts` and
`content-mutations.test.ts` tests.

- [ ] **Step 2: Run the focused tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/church-info supabase/functions/modules/content/gallery supabase/functions/modules/content/pastors
```

Expected result: FAIL because the submodules do not exist.

- [ ] **Step 3: Implement only required layers**

Move the current behavior into the listed files. Keep projection strings inside
each submodule's infrastructure. Do not create `domain/entities` or another
directory unless a source file requires it.

- [ ] **Step 4: Register, run, and commit**

```powershell
deno test -A supabase/functions/modules/content/church-info supabase/functions/modules/content/gallery supabase/functions/modules/content/pastors
git add supabase/functions/modules/content/church-info supabase/functions/modules/content/gallery supabase/functions/modules/content/pastors supabase/functions/modules/content/index.ts supabase/functions/content-data/church-info.ts supabase/functions/content-data/gallery.ts supabase/functions/content-data/pastors.ts
git commit -m "refactor: move content reads into private submodules"
```

## Task 8: Migrate the giving and event-popup submodules

**Files:**
- Create: `supabase/functions/modules/content/giving/domain/ports/GivingRepository.ts`
- Create: `supabase/functions/modules/content/giving/application/GetGivingSettings.ts`
- Create: `supabase/functions/modules/content/giving/application/UpdateGivingSettings.ts`
- Create: `supabase/functions/modules/content/giving/application/giving.test.ts`
- Create: `supabase/functions/modules/content/giving/infrastructure/SupabaseGivingRepository.ts`
- Create: `supabase/functions/modules/content/giving/infrastructure/giving-columns.ts`
- Create: `supabase/functions/modules/content/giving/infrastructure/SupabaseGivingRepository.test.ts`
- Create: `supabase/functions/modules/content/giving/presentation/GivingController.ts`
- Create: `supabase/functions/modules/content/event-popup/domain/ports/EventPopupRepository.ts`
- Create: `supabase/functions/modules/content/event-popup/application/GetEventPopupSettings.ts`
- Create: `supabase/functions/modules/content/event-popup/application/UpsertEventPopupSettings.ts`
- Create: `supabase/functions/modules/content/event-popup/application/event-popup.test.ts`
- Create: `supabase/functions/modules/content/event-popup/infrastructure/SupabaseEventPopupRepository.ts`
- Create: `supabase/functions/modules/content/event-popup/infrastructure/event-popup-columns.ts`
- Create: `supabase/functions/modules/content/event-popup/infrastructure/SupabaseEventPopupRepository.test.ts`
- Create: `supabase/functions/modules/content/event-popup/presentation/EventPopupController.ts`
- Modify: `supabase/functions/modules/content/index.ts`
- Delete after migration: `supabase/functions/content-data/giving.ts`
- Delete after migration: `supabase/functions/content-data/event-popup.ts`

**Interfaces:**
- Giving use cases: `GetGivingSettings` and `UpdateGivingSettings`.
- Event-popup use cases: `GetEventPopupSettings` and `UpsertEventPopupSettings`.
- Missing event-popup row returns the existing disabled fallback object.

- [ ] **Step 1: Write failing use-case and repository tests**

Cover singleton reads, giving update payloads, event-popup upsert conflict
options, and the `PGRST116` fallback. Use fake ports for application tests and
the existing query-call fake for infrastructure tests.

- [ ] **Step 2: Run the tests and verify failure**

```powershell
deno test -A supabase/functions/modules/content/giving supabase/functions/modules/content/event-popup
```

Expected result: FAIL because the submodules do not exist.

- [ ] **Step 3: Implement and register**

Keep direct Supabase access only in the two infrastructure repositories and
preserve the current singleton query behavior.

- [ ] **Step 4: Run and commit**

```powershell
deno test -A supabase/functions/modules/content/giving supabase/functions/modules/content/event-popup
git add supabase/functions/modules/content/giving supabase/functions/modules/content/event-popup supabase/functions/modules/content/index.ts supabase/functions/content-data/giving.ts supabase/functions/content-data/event-popup.ts
git commit -m "refactor: move settings into content submodules"
```

## Task 9: Replace the content-data dispatcher with the thin adapter

**Files:**
- Modify: `supabase/functions/modules/content/index.ts`
- Modify: `supabase/functions/content-data/index.ts`
- Modify: `supabase/functions/content-data/content-data.test.ts`
- Modify: `supabase/functions/content-data/content-mutations.test.ts`
- Modify: `supabase/functions/content-data/resource-queries.test.ts`
- Move: `supabase/functions/content-data/content-index-migration.test.ts` to `supabase/functions/modules/content/content-index-migration.test.ts`
- Delete after migration: `supabase/functions/content-data/resource-columns.ts`

**Interfaces:**
- `dispatchContentRequest(request: FunctionRequest, routes: ContentRoutes): Promise<unknown>` remains the testable dispatcher contract.
- `handleContentRequest(request: Request): Promise<Response>` remains the deployed handler contract.
- The adapter imports `createRequestSupabaseClient` and `createContentModule`; it does not import a private resource submodule.

- [ ] **Step 1: Add failing adapter contract assertions**

Extend `content-data.test.ts` to assert every existing resource/operation pair
is reachable through `createContentModule`, and that unknown resources and
operations still produce `HttpError(400, "INVALID_OPERATION", ...)`. Add a
source-boundary assertion that `content-data/index.ts` contains no imports of
the deleted resource files.

- [ ] **Step 2: Run the adapter test and verify failure**

```powershell
deno test -A supabase/functions/content-data/content-data.test.ts
```

Expected result: FAIL because the dispatcher still receives the old handler map.

- [ ] **Step 3: Implement the thin adapter**

Keep only OPTIONS handling, `parseRequest`, request-scoped client creation,
module composition, dispatch, response envelopes, and the safe
`if (import.meta.main) Deno.serve(handleContentRequest)` entrypoint. Register
exactly these operations:

```text
ministries: list/create/update/delete/sort
events: list/create/update/delete
service-times: list/create/update/delete/sort
church-info: get
sermons: list/latest/create/update/delete
gallery: list/create/delete
pastors: list/create/update/delete/sort
event-popup: get/upsert
giving: get/update
```

- [ ] **Step 4: Remove superseded implementation files**

Delete only old content resource files and test helpers after the module tests
and adapter contract tests pass. Move the content index migration test to the
content module root and update its migration URL from `../../migrations/...` to
`../../../migrations/...`. Keep migrations and unrelated Edge Functions
unchanged.

- [ ] **Step 5: Run the complete content suite and commit**

```powershell
deno test -A supabase/functions/modules/content supabase/functions/content-data supabase/functions/tests/architecture
git add supabase/functions/modules/content supabase/functions/content-data supabase/functions/tests/architecture
git commit -m "refactor: route content-data through content module"
```

## Task 10: Update repository documentation for the real content layout

**Files:**
- Modify: `README.md`
- Modify: `documentations/ARCHITECTURE.md`
- Modify: `documentations/COMPONENTS.md`
- Modify: `documentations/API.md`
- Modify: `documentations/DEVELOPMENT.md`
- Modify: `documentations/SECURITY.md`
- Create: `docs/superpowers/audits/2026-09-26-content-module-documentation-audit.md`
- Create: `supabase/functions/tests/architecture/content-documentation.test.ts`

**Interfaces:**
- Documentation describes `supabase/functions/content-data/index.ts` as a deployment adapter and `supabase/functions/modules/content/*` as the private module implementation.
- Documentation preserves the current content-data request operations and response envelope.

- [ ] **Step 1: Write the failing documentation audit test**

Read the six documentation files from the repository root and assert that they
contain the new `modules/content` boundary and do not prescribe deleted files
such as `supabase/functions/content-data/events.ts`. Assert that
the documentation explains that unused layers and `.gitkeep` files are
omitted. This test may mention `.gitkeep` in its expected explanatory text; it
must not require a `.gitkeep` file.

- [ ] **Step 2: Run the audit test and verify failure**

```powershell
deno test -A supabase/functions/tests/architecture/content-documentation.test.ts
```

Expected result: FAIL because the repository documentation still describes the
previous content function layout.

- [ ] **Step 3: Update the documentation**

Document the deployment-adapter/module distinction, private resource
submodules, layer responsibilities, import and persistence boundaries,
content-data operation mapping, focused Deno tests, architecture checks,
service-role/RLS/secret boundaries, and the rule that unused layers and
`.gitkeep` files are omitted. Do not document future modules as existing
directories.

- [ ] **Step 4: Write the audit report after verification**

Create `docs/superpowers/audits/2026-09-26-content-module-documentation-audit.md`
with the checked file list, the stale-path search command, the architecture
test command, and the observed zero-match result. Do not record a passing
result until the commands have actually completed successfully.

- [ ] **Step 5: Run stale-path and documentation checks**

```powershell
deno test -A supabase/functions/tests/architecture/content-documentation.test.ts
rg -n "functions/content-data/(church-info|events|event-popup|gallery|giving|ministries|pastors|sermons|service-times)\.ts" README.md documentations docs
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
git diff --check
```

Expected result: the Deno audit passes and the stale-path search returns no
matches. An `rg` exit code of 1 means zero matches and is accepted; codes
greater than 1 remain failures. Documentation may mention `.gitkeep` only as a
prohibition.

- [ ] **Step 6: Commit documentation**

```powershell
git add README.md documentations docs/superpowers/audits/2026-09-26-content-module-documentation-audit.md supabase/functions/tests/architecture/content-documentation.test.ts
git commit -m "docs: document content edge module boundaries"
```

## Task 11: Run the complete local verification gate

**Files:**
- No source changes are expected. If a check fails, fix only the content-module or content-documentation file that caused the failure, then rerun the failed command before continuing.

- [ ] **Step 1: Run focused content tests**

```powershell
deno test -A supabase/functions/modules/content supabase/functions/content-data supabase/functions/tests/architecture
```

- [ ] **Step 2: Run the repository Edge Function lane**

```powershell
Set-Location icarecenter-frontend
npm run test:edge
```

- [ ] **Step 3: Run the architecture lane**

```powershell
npm run test:architecture
```

- [ ] **Step 4: Run frontend typecheck and Ultracite**

```powershell
npm run typecheck
npm exec -- ultracite check
```

- [ ] **Step 5: Verify no cross-module or placeholder leakage**

```powershell
Set-Location ..
rg -n "modules/content/(sermons|events|ministries|church-info|gallery|pastors|service-times|giving|event-popup)/(domain|application|infrastructure|presentation)" supabase/functions --glob '*.ts'
Get-ChildItem -Path supabase/functions/modules/content -Filter '.gitkeep' -File -Recurse
git diff --check
git status --short --branch
```

The first command may show internal content-module imports, but no unrelated
top-level module may import a private content submodule. The second command
must return no files.

## Completion criteria

- `content-data` remains callable through its existing deployed function name.
- All current content operations preserve their request and response behavior.
- Every migrated resource is private to `modules/content` and follows the
  domain/application/infrastructure/presentation shape where files are needed.
- No empty layer directory or `.gitkeep` placeholder exists.
- Architecture tests enforce the module boundaries.
- Documentation describes the actual repository layout and verification flow.
- The complete local CI-equivalent checks pass with fresh output.
- No remote Supabase migration, secret change, or function deployment is run as
  part of this plan.
