# Latest Past Livestream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Show the newest completed YouTube livestream in the existing livestream area whenever no broadcast is active, including outside the Sunday checking window.

**Architecture:** The YouTube provider will return either an active or completed public embeddable video while preserving playlist order, so the newest completed upload is selected deterministically. The existing cache table remains unchanged: completed video metadata is stored in the existing offline row and translated to a \`past\` API response. The frontend will render \`live\` and \`past\` through the same iframe component.

**Tech Stack:** Deno TypeScript Edge Functions, Supabase service-role repository, React/Vite, Cypress.

## Global Constraints

- Do not modify the immutable original SQL migration.
- Do not add a database migration or change the cache table schema.
- Show at most one past livestream.
- Prefer the active stream over any completed stream.
- Preserve the existing offline and error fallback links.
- Use TDD: each behavior change starts with a failing test and ends with the affected suite passing.
- Preserve unrelated working-tree changes.

---

### Task 1: Extend the livestream domain contracts

**Files:**
- Modify: \`supabase/functions/modules/youtube-livestream/domain/Livestream.ts\`
- Modify: \`supabase/functions/modules/youtube-livestream/domain/ports/LivestreamProvider.ts\`
- Modify: \`supabase/functions/modules/youtube-livestream/domain/ports/LivestreamCacheRepository.ts\`

**Interfaces:**
- Produce \`LivestreamDiscovery = { kind: "live" | "past"; video: LiveStream }\`.
- Change the provider method to \`findLivestream(): Promise<LivestreamDiscovery | null>\`.
- Add \`past\` to \`LivestreamResponse\` with \`{ status: "past"; video: LiveStream; checkedAt: string }\`.
- Keep \`CacheStatus.status\` limited to the existing database values \`"live" | "offline"\`.
- Add \`savePast(stream: LiveStream): Promise<void>\` to the cache repository port.

- [ ] **Step 1: Write the failing contract consumers in application tests**

Update the test dependency fakes in \`GetActiveLivestream.test.ts\` to expose \`findLivestream\` and \`savePast\`, and add a test input for a completed discovery. The test must fail because the production interfaces do not yet expose the new method/result.

- [ ] **Step 2: Run the application test to verify the expected failure**

Run:

~~~powershell
npx.cmd --yes deno test -A supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.test.ts
~~~

Expected: compile/type errors for the missing \`findLivestream\`, \`savePast\`, and \`past\` contract.

- [ ] **Step 3: Add the domain types and port methods**

Add the \`LivestreamDiscovery\` type, the \`past\` response variant, the new provider method, and the new cache method without changing database status values.

- [ ] **Step 4: Run the domain/application tests**

Run the command from Step 2. Expected: the suite proceeds to behavioral failures, not type errors.

- [ ] **Step 5: Commit the contract change**

~~~powershell
git add supabase/functions/modules/youtube-livestream/domain/Livestream.ts supabase/functions/modules/youtube-livestream/domain/ports/LivestreamProvider.ts supabase/functions/modules/youtube-livestream/domain/ports/LivestreamCacheRepository.ts supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.test.ts
git commit -m "refactor: add past livestream contracts"
~~~

### Task 2: Select the active or newest completed YouTube upload

**Files:**
- Modify: \`supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.ts\`
- Test: \`supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.test.ts\`

**Interfaces:**
- Consume \`LivestreamDiscovery\` from the domain.
- Produce \`findLivestream()\` with playlist-order selection.

- [ ] **Step 1: Add failing provider cases**

Change the provider tests to assert:

~~~text
active public embeddable upload -> { kind: "live", video }
no active upload + newest completed public embeddable upload -> { kind: "past", video }
completed upload that is older than the newest completed upload is ignored
non-public or non-embeddable completed uploads are ignored
no eligible uploads -> null
~~~

The fake \`videos.list\` response must intentionally return items in a different order from \`playlistItems.list\`; the expected result must still be based on playlist order.

- [ ] **Step 2: Run the provider suite to verify it fails**

~~~powershell
npx.cmd --yes deno test -A supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.test.ts
~~~

Expected: failures because the provider still exposes \`findActiveLivestream\` and only returns active results.

- [ ] **Step 3: Implement playlist-order discovery**

Keep the existing three YouTube API calls. Build a map from the \`videos.list\` response by video ID, then iterate the playlist video IDs in order:

~~~ts
const detailsById = new Map(details.map((item) => [item.id, item]));
for (const videoId of playlistVideoIds) {
  const candidate = parseEligibleVideo(detailsById.get(videoId));
  if (candidate?.actualStartTime && !candidate.actualEndTime) {
    return { kind: "live", video: candidate.video };
  }
}
for (const videoId of playlistVideoIds) {
  const candidate = parseEligibleVideo(detailsById.get(videoId));
  if (candidate?.actualEndTime) {
    return { kind: "past", video: candidate.video };
  }
}
return null;
~~~

The parser must require a non-empty title and ID, \`privacyStatus === "public"\`, and \`embeddable === true\`; an upcoming video without \`actualStartTime\` is not eligible.

- [ ] **Step 4: Run the provider suite**

~~~powershell
npx.cmd --yes deno test -A supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.test.ts
~~~

Expected: all provider tests pass.

- [ ] **Step 5: Commit the provider change**

~~~powershell
git add supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.ts supabase/functions/modules/youtube-livestream/infrastructure/YouTubeLivestreamProvider.test.ts
git commit -m "fix: select latest completed youtube livestream"
~~~

### Task 3: Persist and serve past video metadata

**Files:**
- Modify: \`supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.ts\`
- Modify: \`supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.test.ts\`
- Modify: \`supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.ts\`
- Modify: \`supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.test.ts\`

**Interfaces:**
- Consume \`findLivestream()\` and \`LivestreamDiscovery\`.
- Produce \`past\` responses from cached offline rows containing \`video_id\` and \`video_title\`.

- [ ] **Step 1: Add failing cache and application tests**

Add tests that assert:

~~~text
savePast writes status=offline, video_id, video_title, and clears the lease
an in-window past discovery is saved and returned as status=past
an out-of-window cache row with video metadata returns status=past without provider access
an out-of-window cache row without video metadata returns offline
~~~

- [ ] **Step 2: Run the focused tests to verify failure**

~~~powershell
npx.cmd --yes deno test -A supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.test.ts supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.test.ts
~~~

Expected: failures for the missing past persistence and response behavior.

- [ ] **Step 3: Implement cache persistence and use-case behavior**

Implement \`savePast\` as an update of the existing row with \`status: "offline"\`, the completed video's ID/title, and \`refresh_lease_until: null\`. Update cache response mapping so an offline row with both video fields becomes \`past\`. Outside the Sunday window, read the cache and return that mapping; do not call the provider. During the Sunday window, call \`findLivestream\`, save live or past according to \`kind\`, and clear metadata only when the provider returns \`null\`.

If provider lookup fails, restore the previously cached video as \`past\` when metadata was available; otherwise call \`saveOffline\` before throwing the existing sanitized error.

- [ ] **Step 4: Run the focused tests**

Run the command from Step 2. Expected: all application and cache tests pass.

- [ ] **Step 5: Run all Edge tests**

~~~powershell
npx.cmd --yes deno test -A supabase/functions
~~~

Expected: zero failures, including architecture and migration tests; the immutable SQL file remains unchanged.

- [ ] **Step 6: Commit the application/cache change**

~~~powershell
git add supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.ts supabase/functions/modules/youtube-livestream/application/GetActiveLivestream.test.ts supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.ts supabase/functions/modules/youtube-livestream/infrastructure/SupabaseLivestreamCacheRepository.test.ts
git commit -m "feat: cache latest past livestream"
~~~

### Task 4: Render the past stream in the existing frontend area

**Files:**
- Modify: \`icarecenter-frontend/src/domains/livestreams/model/livestream.types.ts\`
- Modify: \`icarecenter-frontend/src/user/sermons/components/YouTubeLivestream.tsx\`
- Modify: \`icarecenter-test/e2e/sermons/youtube-livestream.cy.ts\`

**Interfaces:**
- Consume the API \`past\` response.
- Produce one iframe in \`#livestream\` with the latest past video and an accessible title.

- [ ] **Step 1: Add a failing Cypress case**

Add an intercept returning:

~~~json
{
  "data": {
    "status": "past",
    "video": { "id": "past-video-123", "title": "Communion Sunday" },
    "checkedAt": "2026-01-04T04:00:00.000Z"
  }
}
~~~

Assert that \`#livestream iframe\` uses \`https://www.youtube.com/embed/past-video-123\`, has title \`Watch the latest livestream: Communion Sunday\`, and that the existing Facebook fallback is absent. Run the single Cypress spec and confirm this test fails because the component currently only renders \`live\`.

- [ ] **Step 2: Add the \`past\` frontend union and shared embed rendering**

Add the \`past\` variant to \`livestream.types.ts\`. Update the component to render \`live\` and \`past\` through the same iframe path, varying only the accessible title. Keep the existing offline/error content and links unchanged.

- [ ] **Step 3: Run the Cypress spec**

~~~powershell
cd icarecenter-frontend
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts
~~~

Expected: all livestream Cypress tests pass.

- [ ] **Step 4: Run frontend typecheck and lint**

~~~powershell
npm run typecheck
npm exec -- ultracite check
~~~

Expected: exit code 0 for both commands.

- [ ] **Step 5: Commit the frontend change**

~~~powershell
git add icarecenter-frontend/src/domains/livestreams/model/livestream.types.ts icarecenter-frontend/src/user/sermons/components/YouTubeLivestream.tsx icarecenter-test/e2e/sermons/youtube-livestream.cy.ts
git commit -m "feat: show latest past livestream"
~~~

### Task 5: Final verification and integration

**Files:**
- No new files; inspect all prior changes and preserve unrelated worktree modifications.

- [ ] **Step 1: Run the complete affected local gates**

~~~powershell
npx.cmd --yes deno test -A supabase/functions
cd icarecenter-frontend
npm run typecheck
npm exec -- ultracite check
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts
~~~

Expected: every command exits 0; Edge output reports 152 or more passing tests and Cypress reports all livestream tests passing.

- [ ] **Step 2: Confirm immutable SQL and working-tree boundaries**

~~~powershell
git diff HEAD~4 -- supabase/migrations/mainstream/20260819000000_add_youtube_livestream_status.sql
git status --short --branch
git log --oneline -5
~~~

Expected: no diff for the original migration, only intended livestream commits, and unrelated user changes remain unstaged.

- [ ] **Step 3: Deploy if Supabase permissions allow and verify production**

~~~powershell
npx.cmd --yes supabase@latest functions deploy youtube-livestream --project-ref neddwzfwqcjsdjinoato --no-verify-jwt
~~~

Then call the production endpoint during a checking window and verify the response is \`live\`, \`past\`, or \`offline\` with the expected shape. If Supabase again returns HTTP 403, report deployment as blocked rather than claiming production is updated.

- [ ] **Step 4: Push the complete development history**

~~~powershell
git push origin development
~~~
