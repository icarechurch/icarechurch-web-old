# YouTube Livestream Feature Handoff

Date: 2026-08-19  
Repository: `icarecenter-web`  
Original workspace: `C:\Users\adriaan's corner\Desktop\icarecenter-web`

## Objective

Replace the Sermons page's Facebook livestream integration with the church's
YouTube livestream:

- Channel: `https://www.youtube.com/@ICareCenter-media`
- Show only a currently active, public, embeddable broadcast.
- Do not show scheduled, past, private, or unlisted streams.
- When no qualifying stream exists, show an accessible offline state and a
  link to the channel.
- Keep all Google/YouTube credentials server-side.

## Polling constraints

The user clarified that “52 times per year” means 52 checking windows, not 52
individual API calls.

- Timezone: `Asia/Taipei` (GMT+8)
- Eligible window: Sunday from 5:00 AM inclusive to 12:00 PM exclusive
- Eligible Sundays: the first 52 Sundays in each Asia/Taipei calendar year
- A rare 53rd Sunday is excluded
- Refresh cadence: at most once every ten minutes during an eligible window
- Refreshes are traffic-triggered; there is no background polling without a
  visitor
- Maximum: 42 provider calls per eligible Sunday, 2,184 per 52-window year
- Outside the eligible window, return offline without calling YouTube

## Approved architecture

A dedicated Supabase Edge Function named `youtube-livestream` will:

1. Accept `{ resource: "livestream", operation: "get-active" }`.
2. Return the project's standard `{ data: ... }` success envelope.
3. Return offline immediately outside eligible checking windows.
4. Use a private singleton Supabase cache row inside eligible windows.
5. Atomically claim stale refreshes before calling YouTube.
6. Record an offline state and provider-attempt timestamp at claim time.
7. Prevent concurrent visitors from creating duplicate YouTube requests.
8. Abort the YouTube request after 30 seconds.
9. Query only active, embeddable, syndicated videos from the configured
   channel.
10. Return either:

```ts
{ status: "live"; video: { id: string; title: string }; checkedAt: string }
{ status: "offline"; checkedAt: string | null }
```

Provider/configuration failures must save offline and return:

```json
{
  "error": {
    "code": "YOUTUBE_LOOKUP_FAILED",
    "message": "Unable to check for a live stream"
  }
}
```

with HTTP status 502.

## Security requirements

- Use a service-role client only inside the Edge Function for cache access.
- Deny `anon` and `authenticated` direct access to the cache table and
  refresh-claim RPC.
- Store these only as Supabase Edge Function secrets:
  - `YOUTUBE_API_KEY`
  - `YOUTUBE_CHANNEL_ID`
- Do not add either secret to Git, `.env`, `.env.example`, or any
  `VITE_*` browser variable.
- Public YouTube discovery uses an API key; OAuth is not required because
  private data is explicitly out of scope.

## Mandatory deployment pause

Do not run any of the following until the user has connected Supabase and
explicitly authorized the remote changes:

- `supabase db push`
- `supabase secrets set`
- `supabase functions deploy`

The user specifically asked to be notified before any Edge Function
deployment so they can connect Supabase and obtain/configure the Google API
key.

## Reviewed documents

- Design:
  `docs/superpowers/specs/2026-08-19-youtube-public-livestream-design.md`
- Implementation plan:
  `docs/superpowers/plans/2026-08-19-youtube-public-livestream.md`

The design passed independent specification review. The implementation plan
contains three reviewed chunks and fourteen focused implementation commits,
satisfying the user's requirement for a minimum of ten commits.

## Confirmed Git history

The following documentation/setup commits were confirmed before the terminal
started hanging:

- `323a3a4 docs: design YouTube livestream integration`
- `b31af93 docs: clarify livestream function contract`
- `e508d76 docs: add Sunday livestream refresh window`
- `11b007f docs: clarify livestream polling limits`
- `ceebaed docs: harden livestream refresh lease`
- `3c08ff3 chore: ignore local worktrees`

The attempt to commit the implementation plan was interrupted. Verify whether
the plan is still untracked before committing it on the new laptop.

## Working tree caveats

- `package-lock.json` already had a user-owned modification before this
  feature work. Preserve it and do not include it in feature commits unless
  the user explicitly asks.
- `.gitignore` now contains `worktree/`.
- The user requested a project-local `worktree/` location.
- No worktree was successfully created before handoff.
- No feature implementation files were created.
- No migration, secret, or Edge Function was deployed.
- Git/terminal commands on the original laptop began hanging, including a
  read-only `git status`; this prompted the laptop transfer.

## Implementation sequence

Follow the reviewed implementation plan. Its intended commit sequence is:

1. Migration contract test
2. Private singleton cache migration and atomic claim RPC
3. Taiwan-time boundary tests
4. Schedule implementation
5. Cache repository tests
6. Cache repository implementation
7. YouTube provider tests
8. YouTube provider implementation
9. Edge Function handler tests
10. Edge Function handler implementation
11. Frontend domain/API/hook boundary
12. Accessible YouTube component and browser tests
13. Sermons page switch and Facebook integration removal
14. Verification and deployment checklist

Use test-driven development and keep each item in a focused commit. Remove
both:

- `src/user/sermons/components/FacebookLiveEmbed.tsx`
- `netlify/functions/facebook-latest-video.js`

## Local verification before the deployment pause

Run:

```powershell
npm exec -- ultracite check
npm run typecheck
npm run test:edge
npm run test:architecture
npx cypress run --spec cypress/e2e/sermons/youtube-livestream.cy.ts
npm run build
```

All local checks must pass before asking the user to connect Supabase.

## First steps on the new laptop

1. Copy or clone the repository.
2. Confirm the design and plan documents exist.
3. Run `git status --short`.
4. Preserve the pre-existing `package-lock.json` change.
5. Commit the reviewed plan separately if it is still untracked.
6. Confirm `worktree/` is ignored with `git check-ignore -v worktree`.
7. Create a feature worktree and branch, for example:

```powershell
git worktree add worktree/youtube-livestream -b feature/youtube-livestream
```

8. Install dependencies in the worktree and run baseline tests.
9. Execute the reviewed plan.
10. Stop before all remote Supabase actions and notify the user.
