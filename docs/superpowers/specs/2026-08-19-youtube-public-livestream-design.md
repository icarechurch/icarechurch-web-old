# YouTube public livestream design

## Goal

Show the currently active public livestream from the ICare Center YouTube
channel (`@ICareCenter-media`) on the Sermons page. No player is shown when
the channel is not live. The implementation must not expose Google credentials
to website visitors.

## Scope

- Replace the Facebook-specific livestream embed with a YouTube embed.
- Detect only active, public, embeddable broadcasts from the configured
  channel during the weekly Sunday refresh window.
- Show a clear offline state and a link to the channel when no qualifying
  broadcast exists.
- Keep YouTube API configuration entirely in Supabase Edge Function secrets.
- Limit YouTube discovery to Sunday 5:00 AM–12:00 PM Asia/Taipei, with at most
  one provider request per ten-minute interval when visitors request the page.

Out of scope: scheduled streams, past broadcasts, private or unlisted
broadcasts, YouTube account authorization, background polling without visitor
traffic, and automatic publishing of Supabase resources.

## Architecture

The browser calls a new public Supabase Edge Function, `youtube-livestream`,
through the project's existing `invokeFunction` helper. Its request body is
`{ resource: "livestream", operation: "get-active" }` and its successful
response uses the shared `{ data: ... }` envelope.

The function owns all YouTube calls and a single-row
`youtube_livestream_status` cache in Supabase. The row stores the most recent
live/offline result, the timestamp of the last provider attempt, and a short
refresh lease. Direct browser access to the table is denied; only the
function's service-role client can read or update it.

Outside Sunday 5:00 AM–12:00 PM in `Asia/Taipei`, the function immediately
returns `offline` without contacting YouTube. Within that window, it returns
the cached result if the last provider attempt is less than ten minutes old.
If stale, it atomically claims the one-minute refresh lease before calling
YouTube; concurrent visitors return the prior safe result while the claimant
refreshes. The provider-attempt timestamp is written for successful, offline,
and failed lookups, so a failure also begins the ten-minute cooldown.

The first 52 Sundays in each Asia/Taipei calendar year are eligible checking
windows. A rare 53rd Sunday is not eligible: the function returns `offline`
without a provider call. Each eligible seven-hour window permits at most 42
provider requests, or 2,184 requests in a 52-window year, without visitor
traffic multiplying provider calls.

After claiming a refresh, the function calls the YouTube Data API using a
server-side API key and a configured channel ID. It requests a single video
limited to:

- `eventType=live` (currently active broadcasts)
- `type=video`
- `videoEmbeddable=true`
- `videoSyndicated=true`

Unauthenticated YouTube Data API queries return public data. The `data` value
is one of the following discriminated responses:

```ts
{ status: "live"; video: { id: string; title: string }; checkedAt: string }
{ status: "offline"; checkedAt: string | null }
```

It never returns its API key or the upstream provider response. The client
caches the resolved result for 60 seconds to avoid redundant function calls
while a visitor remains on the page.

The existing client helper invokes the function. A dedicated React component
renders a 16:9 YouTube iframe only for a `live` response; for `offline`,
loading, and recoverable lookup-error cases it renders an accessible status
message plus a link to `https://www.youtube.com/@ICareCenter-media`.

## Data flow

```text
Visitor opens Sermons page
  -> client invokes youtube-livestream Edge Function
  -> function returns offline outside the Sunday Taiwan-time window
  -> during the window, function reads its single cached status row
  -> stale cache lease holder queries YouTube for an active public embed
  -> function saves a live/offline result and provider-attempt timestamp,
     then releases the lease
  -> { status: "live", video } or { status: "offline" }
  -> page renders YouTube player or offline state
```

The function configures CORS consistently with the project’s existing Edge
Functions. Its non-mutating lookup endpoint is available without a signed-in
user; the Google API key and service-role credential remain server-side
secrets.

## Configuration and deployment gate

The deployment requires two Supabase Edge Function secrets:

- `YOUTUBE_API_KEY`: a Google Cloud API key restricted to the YouTube Data API
  v3.
- `YOUTUBE_CHANNEL_ID`: the immutable channel ID resolved from
  `@ICareCenter-media`.

Before any `supabase functions deploy` command or remote secret change, work
will pause and notify the user. The user will connect Supabase and provide or
configure the restricted API key. No credentials will be committed to the
repository or added to browser environment variables.

## Error handling

- Missing configuration, a malformed provider response, or a YouTube request
  failure returns HTTP 502 with the existing error envelope:
  `{ error: { code: "YOUTUBE_LOOKUP_FAILED", message: "Unable to check for a live stream" } }`.
  Before returning, the function saves an `offline` cache state and the failed
  provider-attempt timestamp. This does not expose provider details or secrets.
- No matching result is a normal `offline` response, not an error.
- The lease is cleared after both successful and failed provider calls. The
  persisted provider-attempt timestamp prevents a transient error from
  triggering another provider call before the next ten-minute interval.
- The client treats lookup failures the same as offline for visitors, with an
  accessible message and channel link.
- The iframe uses YouTube’s video-specific embed URL with an explicit title,
  allowing browser controls and full-screen use.

## Testing

- Unit-test the Taipei Sunday-window and 53rd-Sunday boundaries, cache
  freshness, atomic refresh claiming, provider parameters, and response
  mapping for live, offline, malformed, and provider-error responses.
- Migration-test the single cache row, its constraints, and its no-direct-
  access RLS policy.
- Unit-test the React component for loading, live, offline, and error states.
- Run the focused Edge Function tests, frontend typecheck/build, and Ultracite
  check before deployment.
- After the user connects Supabase and secrets are configured, invoke the
  deployed function and verify an offline state when no active stream exists,
  then verify a player during a public live broadcast.
