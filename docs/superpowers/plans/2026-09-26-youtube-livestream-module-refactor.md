# YouTube Livestream Module Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the YouTube livestream Edge Function into the established MeatLens-style domain/application/infrastructure/presentation module without changing its public contract.

**Architecture:** Keep the configured Supabase entrypoint thin. Put livestream scheduling and response state in `domain`, the cache/provider orchestration in an `application` use case, Supabase and YouTube integrations in `infrastructure`, HTTP route handling in `presentation`, and dependency wiring in the module composition root.

**Tech Stack:** Deno, TypeScript, Supabase Edge Functions, `@supabase/supabase-js`, Deno test.

## Global Constraints

- Preserve the public `youtube-livestream` function name and `livestream/get-active` request contract.
- Preserve response envelopes, status values, Sunday/Taipei eligibility rules, ten-minute freshness, cache lease behavior, and environment variable names.
- Keep `_shared/` limited to genuinely cross-cutting HTTP and error utilities.
- Domain code must not import Deno, Supabase, HTTP, or environment APIs.
- Application classes expose one public `execute` method.
- Infrastructure owns Supabase client construction, database access, YouTube fetches, and environment reads.
- Do not add `.gitkeep` files or empty layer directories.

---

### Task 1: Add failing YouTube architecture contracts

**Files:**
- Modify: `supabase/functions/tests/architecture/edge-module-boundaries.test.ts`
- Create: `supabase/functions/modules/youtube-livestream/youtube-module-boundaries.test.ts`

- [x] **Step 1: Assert the layered tree and forbidden dependencies.**

Require the non-empty layer directories and assert that production files under `domain/` do not contain `Deno`, Supabase, `fetch`, or `Request`; application files do not contain runtime or persistence imports; presentation files do not contain Supabase persistence calls; and the composition root is the only place that assembles infrastructure.

- [x] **Step 2: Run the architecture test and verify it fails.**

Run:

```powershell
npx --yes deno test -A supabase/functions/modules/youtube-livestream/youtube-module-boundaries.test.ts
```

Expected: FAIL because the layered directories and files do not exist yet.

### Task 2: Extract domain and application behavior

**Files:**
- Create: `supabase/functions/modules/youtube-livestream/domain/Livestream.ts`
- Create: `supabase/functions/modules/youtube-livestream/domain/LivestreamSchedule.ts`
- Create: `supabase/functions/modules/youtube-livestream/domain/ports/LivestreamCacheRepository.ts`
- Create: `supabase/functions/modules/youtube-livestream/domain/ports/LivestreamProvider.ts`
- Create: `supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.ts`
- Move/update tests under the corresponding layer directories.

- [x] **Step 1: Write domain and use-case tests first.**

Cover Sunday/Taipei eligibility, freshness, cached live/offline responses, lease contention, provider no-result, provider failure sanitization, and cache cleanup failure behavior.

- [x] **Step 2: Verify the tests fail for missing modules.**

Run the focused domain/application tests and confirm missing-module failures.

- [x] **Step 3: Implement the pure domain policies and ports.**

Move `LiveStream`, `LivestreamResponse`, `CacheStatus`, schedule constants, schedule functions, and repository/provider contracts into the domain layer without runtime imports.

- [x] **Step 4: Implement `GetActiveLivestream.execute`.**

Inject `{ cache, provider, now }`, preserve the existing orchestration, and return the same response union. Keep HTTP errors out of the application layer; expose a typed application/provider failure that presentation can map.

- [x] **Step 5: Run domain/application tests.**

Run:

```powershell
npx --yes deno test -A supabase/functions/modules/youtube-livestream/domain supabase/functions/modules/youtube-livestream/application
```

Expected: all focused tests pass.

### Task 3: Extract infrastructure adapters

**Files:**
- Create: `supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.ts`
- Create: `supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.ts`
- Move/update: cache and provider tests into `infrastructure/`.

- [x] **Step 1: Move the existing cache/provider tests and update imports.**

Keep assertions for the singleton query, atomic claim RPC, live/offline writes, YouTube filters, timeout, malformed payloads, and non-OK responses.

- [x] **Step 2: Implement the Supabase cache repository.**

Keep the typed repository adapter and service-role factory together in infrastructure; read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only there.

- [x] **Step 3: Implement the YouTube provider adapter.**

Read `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID`, perform the bounded request, validate the unknown payload, and return `LiveStream | null` through the provider port.

- [x] **Step 4: Run infrastructure tests.**

Run:

```powershell
npx --yes deno test -A supabase/functions/modules/youtube-livestream/infrastructure
```

Expected: all infrastructure tests pass.

### Task 4: Add presentation, composition, and entrypoint boundaries

**Files:**
- Create: `supabase/functions/modules/youtube-livestream/presentation/LivestreamController.ts`
- Create: `supabase/functions/modules/youtube-livestream/index.ts`
- Modify: `supabase/functions/modules/youtube-livestream/entrypoint.ts`
- Move/update: `index.test.ts` to presentation/application coverage.

- [x] **Step 1: Write failing controller and composition tests.**

Assert operation validation, delegation to the use case, stable success/error envelopes, CORS preflight, and that the entrypoint has no provider/database implementation.

- [x] **Step 2: Implement the controller.**

Parse the `livestream/get-active` route input and map application results/errors to the existing HTTP response behavior using shared request/response utilities only at the presentation boundary.

- [x] **Step 3: Implement the composition root.**

Create `createLivestreamModule()` to construct infrastructure adapters and the use case. Keep `entrypoint.ts` responsible only for transport setup and `Deno.serve` registration.

- [x] **Step 4: Run the full YouTube module suite.**

Run:

```powershell
npx --yes deno test -A supabase/functions/modules/youtube-livestream
```

Expected: all existing and new tests pass.

### Task 5: Verify architecture, documentation, and deployment

**Files:**
- Modify: `docs/superpowers/plans/2026-09-26-youtube-livestream-module-refactor.md`
- Modify: relevant Edge Function architecture/module documentation if paths are mentioned.

- [x] **Step 1: Run all Edge Function architecture tests.**

```powershell
npx --yes deno test -A supabase/functions/tests/architecture supabase/functions/modules/youtube-livestream
```

- [x] **Step 2: Run the complete Edge Function suite.**

```powershell
npx --yes deno test -A supabase/functions
```

- [x] **Step 3: Deploy and verify the public function name.**

```powershell
npx supabase@latest functions deploy youtube-livestream --project-ref neddwzfwqcjsdjinoato --jobs 1
npx supabase@latest functions list --project-ref neddwzfwqcjsdjinoato
```

Expected: `youtube-livestream` remains active and reports the module-owned entrypoint.

- [ ] **Step 4: Run `git diff --check`, review the diff, and commit.**

```powershell
git diff --check
git add -A
git commit -m "refactor: layer youtube livestream module"
```
