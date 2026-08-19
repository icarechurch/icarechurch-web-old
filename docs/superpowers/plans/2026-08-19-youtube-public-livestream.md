# YouTube Public Livestream Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display only ICare Center's active public YouTube livestream on the Sermons page, with external lookup limited to Sunday-morning Taiwan-time windows.

**Architecture:** A dedicated Supabase Edge Function owns the YouTube lookup and a service-role-only singleton cache row. It returns offline outside the first 52 Sunday 5:00 AM-12:00 PM Asia/Taipei windows; within one, it uses an atomic offline-first claim to allow at most one lookup every ten minutes. React calls the function through the existing helper and renders a YouTube iframe only for a live response.

**Tech Stack:** React 18, TypeScript, Vite, Supabase Edge Functions/Deno, PostgreSQL migrations, YouTube Data API v3, Cypress, Ultracite.

---

## File structure

- `supabase/migrations/mainstream/20260819000000_add_youtube_livestream_status.sql`: one protected cache row and the atomic refresh-claim RPC.
- `supabase/functions/youtube-livestream/types.ts`: cache/provider/public response unions.
- `supabase/functions/youtube-livestream/schedule.ts`: pure Taipei-window and ten-minute freshness rules.
- `supabase/functions/youtube-livestream/cache.ts`: service-role cache read/claim/write operations.
- `supabase/functions/youtube-livestream/youtube.ts`: 30-second bounded YouTube API call.
- `supabase/functions/youtube-livestream/index.ts`: request validation, orchestration, and response envelopes.
- `src/domains/livestreams/{model,api,hooks}`: browser-side type, Edge Function API, and 60-second query cache.
- `src/user/sermons/components/YouTubeLivestream.tsx`: loading, live, and offline UI.
- `src/user/sermons/pages/SermonsPage.tsx`: replaces Facebook-specific livestream wiring.
- `cypress/e2e/sermons/youtube-livestream.cy.ts`: mocked live/offline/error browser coverage.
- `netlify/functions/facebook-latest-video.js`: deleted with the retired Facebook livestream integration.

## Chunk 1: Persistent cache and schedule

### Task 1: Write the cache migration contract test

**Files:**
- Create: `supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts`

- [ ] **Step 1: Create a failing Deno migration test**

```ts
const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260819000000_add_youtube_livestream_status.sql",
    import.meta.url,
  ),
);

Deno.test("protects the singleton livestream cache", () => {
  for (const expected of [
    "CREATE TABLE public.youtube_livestream_status",
    "CHECK (singleton_key)",
    "ENABLE ROW LEVEL SECURITY",
    "REVOKE ALL ON TABLE public.youtube_livestream_status FROM anon, authenticated",
  ]) {
    if (!migration.includes(expected)) throw new Error(`Missing: ${expected}`);
  }
});
```

- [ ] **Step 2: Verify it fails**

Run: `deno test -A supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts`

Expected: FAIL because the migration is absent.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts
git commit -m "test: define livestream cache migration contract"
```

### Task 2: Implement and verify the cache migration

**Files:**
- Create: `supabase/migrations/mainstream/20260819000000_add_youtube_livestream_status.sql`
- Modify: `supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts`

- [ ] **Step 1: Create the protected singleton table**

Create `youtube_livestream_status` with `singleton_key BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton_key)`, constrained `status` (`live`/ `offline`), nullable `video_id`/ `video_title`, `provider_attempted_at`, and `refresh_lease_until`. Seed its TRUE row. Enable RLS, revoke table access from `anon` and `authenticated`, and grant table access only to `service_role`.

- [ ] **Step 2: Create atomic claim RPC**

Create `public.claim_youtube_livestream_refresh(p_now timestamptz) RETURNS boolean` as `SECURITY DEFINER SET search_path = public`. Its one guarded update must set `status = 'offline'`, clear video fields, set `provider_attempted_at = p_now`, and set the one-minute lease only when `provider_attempted_at IS NULL OR provider_attempted_at <= p_now - interval '10 minutes'`, and no active lease exists. Return `FOUND`; a false result means another request owns the fresh claim and the handler must return offline without another decision query. Revoke execution from `anon` and `authenticated`; grant only `service_role`.

- [ ] **Step 3: Extend test and verify it passes**

Assert for the RPC, its boolean result, null-or-stale exact ten-minute condition, offline-first update, and service-role execute grant. Run: `deno test -A supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts`. Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/mainstream/20260819000000_add_youtube_livestream_status.sql supabase/functions/youtube-livestream/youtube-livestream-migration.test.ts
git commit -m "feat: add private livestream cache"
```

### Task 3: Write failing Taiwan-window tests

**Files:**
- Create: `supabase/functions/youtube-livestream/schedule.test.ts`

- [ ] **Step 1: Test exact boundaries**

Write UTC-fixture tests that map to Asia/Taipei: 04:59 Sunday is false; 05:00 and 11:59 Sunday are true; 12:00 Sunday and weekdays are false. Assert Sunday numbers 1 through 52 are eligible and 53 is ineligible. Assert a provider attempt is fresh at 9:59.999 and stale at 10:00.

- [ ] **Step 2: Verify failure**

Run: `deno test -A supabase/functions/youtube-livestream/schedule.test.ts`. Expected: FAIL because `schedule.ts` is absent.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/youtube-livestream/schedule.test.ts
git commit -m "test: define Taiwan livestream window boundaries"
```

### Task 4: Implement the pure schedule module

**Files:**
- Create: `supabase/functions/youtube-livestream/schedule.ts`
- Modify: `supabase/functions/youtube-livestream/schedule.test.ts`

- [ ] **Step 1: Implement the rules**

Export `isEligibleCheckingWindow(now: Date): boolean` and `isFreshAttempt(attemptedAt: string | null, now: Date): boolean`. Use `Intl.DateTimeFormat(..., { timeZone: "Asia/Taipei" }).formatToParts()`; do not use the host timezone. Name constants `TAIPEI_TIME_ZONE`, `CHECK_WINDOW_START_HOUR`, `CHECK_WINDOW_END_HOUR`, `MAX_SUNDAY_WINDOWS`, and `REFRESH_INTERVAL_MS`.

- [ ] **Step 2: Verify pass and commit**

Run: `deno test -A supabase/functions/youtube-livestream/schedule.test.ts`. Expected: PASS.

```bash
git add supabase/functions/youtube-livestream/schedule.ts supabase/functions/youtube-livestream/schedule.test.ts
git commit -m "feat: enforce Sunday livestream windows"
```

## Chunk 2: Edge Function lookup pipeline

### Task 5: Write cache repository tests

**Files:**
- Create: `supabase/functions/youtube-livestream/cache.test.ts`

- [ ] **Step 1: Define fake-client assertions**

Use a narrow fake client. Test that `readStatus` selects only the singleton row, `claimRefresh` invokes only `claim_youtube_livestream_refresh`, and `saveLive`/ `saveOffline` clear `refresh_lease_until`. Test a provider failure retains the claim-time attempt timestamp while persisting offline.

- [ ] **Step 2: Verify failure and commit**

Run: `deno test -A supabase/functions/youtube-livestream/cache.test.ts`. Expected: FAIL because `cache.ts` is absent.

```bash
git add supabase/functions/youtube-livestream/cache.test.ts
git commit -m "test: define livestream cache repository"
```

### Task 6: Implement the service-role cache repository

**Files:**
- Create: `supabase/functions/youtube-livestream/types.ts`
- Create: `supabase/functions/youtube-livestream/cache.ts`
- Modify: `supabase/functions/youtube-livestream/cache.test.ts`

- [ ] **Step 1: Define discriminated types**

```ts
export type LivestreamResponse =
  | { status: "live"; video: { id: string; title: string }; checkedAt: string }
  | { status: "offline"; checkedAt: string | null };
```

Define matching internal cache row and provider types. Never model an offline response with video data.

- [ ] **Step 2: Implement read/claim/save**

Construct the client exclusively with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Read `singleton_key = true`; call the claim RPC with `p_now`; write only the live/offline fields and clear leases. Throw descriptive internal errors for missing configuration/database errors.

- [ ] **Step 3: Verify pass and commit**

Run: `deno test -A supabase/functions/youtube-livestream/cache.test.ts`. Expected: PASS.

```bash
git add supabase/functions/youtube-livestream/types.ts supabase/functions/youtube-livestream/cache.ts supabase/functions/youtube-livestream/cache.test.ts
git commit -m "feat: cache livestream lookup results"
```

### Task 7: Write failing YouTube provider tests

**Files:**
- Create: `supabase/functions/youtube-livestream/youtube.test.ts`

- [ ] **Step 1: Mock provider scenarios**

Mock `fetch`. Assert `search.list` sends `part=snippet`, `channelId`, `eventType=live`, `type=video`, `videoEmbeddable=true`, `videoSyndicated=true`, and `maxResults=1`. Test valid mapping, empty results as offline, malformed first result rejection, non-OK response rejection, and a 30-second abort signal.

- [ ] **Step 2: Verify failure and commit**

Run: `deno test -A supabase/functions/youtube-livestream/youtube.test.ts`. Expected: FAIL because `youtube.ts` is absent.

```bash
git add supabase/functions/youtube-livestream/youtube.test.ts
git commit -m "test: define YouTube livestream lookup"
```

### Task 8: Implement the bounded YouTube lookup

**Files:**
- Create: `supabase/functions/youtube-livestream/youtube.ts`
- Modify: `supabase/functions/youtube-livestream/youtube.test.ts`

- [ ] **Step 1: Implement `findActivePublicLivestream`**

Read only `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` from `Deno.env`. Use `URLSearchParams` and `AbortSignal.timeout(30_000)`. Validate response success, `id.videoId`, and `snippet.title`; return `LiveStream | null`. Convert all provider/validation failures to a non-secret internal error.

- [ ] **Step 2: Verify pass and commit**

Run: `deno test -A supabase/functions/youtube-livestream/youtube.test.ts`. Expected: PASS.

```bash
git add supabase/functions/youtube-livestream/youtube.ts supabase/functions/youtube-livestream/youtube.test.ts
git commit -m "feat: fetch active public YouTube streams"
```

### Task 9: Write failing Edge Function handler tests

**Files:**
- Create: `supabase/functions/youtube-livestream/index.test.ts`

- [ ] **Step 1: Test injected dependencies**

Cover OPTIONS; invalid request; unsupported resource/operation; ineligible-window offline without cache/provider; fresh cache; unclaimed refresh; claimed live; claimed no-result offline; and missing configuration, malformed provider response, timeout/AbortError, and provider network error each saving offline then returning the exact `YOUTUBE_LOOKUP_FAILED` 502 envelope.

- [ ] **Step 2: Verify failure and commit**

Run: `deno test -A supabase/functions/youtube-livestream/index.test.ts`. Expected: FAIL because no testable handler exists.

```bash
git add supabase/functions/youtube-livestream/index.test.ts
git commit -m "test: define livestream function responses"
```

### Task 10: Implement the Edge Function

**Files:**
- Create: `supabase/functions/youtube-livestream/index.ts`
- Modify: `supabase/functions/youtube-livestream/index.test.ts`

- [ ] **Step 1: Implement dependency-injected orchestration**

Reuse `parseRequest`, `createOptionsResponse`, `ok`, `failFromError`, and `HttpError` from `supabase/functions/_shared`. Permit only `{ resource: "livestream", operation: "get-active" }`. Check eligibility before database access, return fresh cache, atomically claim stale cache, call the provider, and save live/offline. On every configuration, malformed-provider, timeout, or provider error, save offline/clear lease and throw `new HttpError(502, "YOUTUBE_LOOKUP_FAILED", "Unable to check for a live stream")`; then let `failFromError` produce the exact error envelope.

- [ ] **Step 2: Add safe entry point**

Use `if (import.meta.main) Deno.serve(handleLivestreamRequest);` so tests never start a server.

- [ ] **Step 3: Verify pass and commit**

Run: `deno test -A supabase/functions/youtube-livestream && npm run test:edge`. Expected: PASS.

```bash
git add supabase/functions/youtube-livestream
git commit -m "feat: add YouTube livestream edge function"
```

## Chunk 3: Website integration and guarded rollout

### Task 11: Add the frontend data boundary

**Files:**
- Create: `src/domains/livestreams/model/livestream.types.ts`
- Create: `src/domains/livestreams/api/livestreams.api.ts`
- Create: `src/domains/livestreams/hooks/useLivestream.ts`

- [ ] **Step 1: Implement typed function access**

Call `invokeFunction<LivestreamResponse>("youtube-livestream", { resource: "livestream", operation: "get-active" })`. Use `useQuery` key `["youtube-livestream"]` with `staleTime: 60_000` and no refetch interval. Never use browser `.from()` or `.rpc()`.

- [ ] **Step 2: Verify and commit**

Run: `npm run test:architecture && npm run typecheck`. Expected: PASS.

```bash
git add src/domains/livestreams
git commit -m "feat: add livestream client data boundary"
```

### Task 12: Create accessible live/offline presentation with browser tests

**Files:**
- Create: `src/user/sermons/components/YouTubeLivestream.tsx`
- Create: `cypress/e2e/sermons/youtube-livestream.cy.ts`

- [ ] **Step 1: Write Cypress intercept tests**

Intercept the Edge Function before `cy.visit("/sermons")`. Hold a delayed request long enough to assert the semantic loading status. A live response must render a YouTube `/embed/<videoId>` iframe with title and fullscreen permission. Offline and error responses must render no iframe, expose a status, and link securely to `https://www.youtube.com/@ICareCenter-media`.

- [ ] **Step 2: Implement the component**

Use `useLivestream`. Render a semantic status for loading/offline/error. Render a responsive 16:9 iframe only for live data with `allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"`, explicit title, and no autoplay.

- [ ] **Step 3: Verify and commit**

Run: `npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts`. Expected: PASS.

```bash
git add src/user/sermons/components/YouTubeLivestream.tsx cypress/e2e/sermons/youtube-livestream.cy.ts
git commit -m "feat: render public YouTube livestreams"
```

### Task 13: Switch the Sermons page from Facebook to YouTube

**Files:**
- Modify: `src/user/sermons/pages/SermonsPage.tsx`
- Delete: `src/user/sermons/components/FacebookLiveEmbed.tsx`
- Delete: `netlify/functions/facebook-latest-video.js`
- Modify: `cypress/e2e/sermons/youtube-livestream.cy.ts`

- [ ] **Step 1: Replace Facebook wiring**

Replace `FacebookLiveEmbed`, its fallback URL, and Facebook copy/link with `YouTubeLivestream`; retain the livestream anchor and layout. Remove the unused `useChurchInfo` query. Delete the unused `facebook-latest-video` Netlify Function. Assert in Cypress that the section does not contain `facebook.com` or load the Facebook SDK.

- [ ] **Step 2: Verify and commit**

Run: `npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts && npm run typecheck`. Expected: PASS.

```bash
git add src/user/sermons/pages/SermonsPage.tsx src/user/sermons/components/FacebookLiveEmbed.tsx netlify/functions/facebook-latest-video.js cypress/e2e/sermons/youtube-livestream.cy.ts
git commit -m "feat: switch sermons livestream to YouTube"
```

### Task 14: Verify locally and stop for remote configuration

**Files:**
- Modify: `docs/superpowers/specs/2026-08-19-youtube-public-livestream-design.md`

- [ ] **Step 1: Document manual setup**

Append the exact requirements: connect Supabase; enable YouTube Data API v3; create/restrict a Google API key; set `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` as Supabase secrets; apply the migration; then authorize deployment. State that neither secret belongs in Git, `.env`, or browser variables.

- [ ] **Step 2: Run final local verification**

Run: `npm exec -- ultracite check && npm run typecheck && npm run test:edge && npm run test:architecture && npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts && npm run build`.

Expected: every command PASS.

- [ ] **Step 3: Commit and stop**

```bash
git add docs/superpowers/specs/2026-08-19-youtube-public-livestream-design.md
git commit -m "docs: add livestream deployment checklist"
```

Do not run `supabase db push`, `supabase secrets set`, or `supabase functions deploy`. Notify the user that local work is ready and request Supabase connection and the two secrets.

## Commit accounting

Tasks 1-14 create fourteen focused commits, satisfying the user's minimum of ten without empty or artificial commits. The existing design-only commits remain separate from implementation work.
