# Latest Past Livestream Design

## Goal

Keep the existing livestream area useful when no broadcast is currently live by showing the newest completed YouTube livestream. Only one past livestream is shown, and it remains available every day until a newer livestream replaces it.

## Behavior

- An active public, embeddable broadcast takes precedence and is returned as `live`.
- If no active broadcast exists, the newest completed public, embeddable livestream is returned as `past`.
- If no completed livestream exists, the response remains `offline`.
- The existing immutable SQL migration is not modified.
- The existing cache table stores the past video's ID and title while retaining an `offline` cache status; the API response exposes that cached video as `past`.
- Cached past data is served outside the Sunday checking window, so the archive remains visible on weekdays without repeated provider calls.

## Data flow

The YouTube provider reads the channel uploads playlist and video metadata. It returns the first active broadcast when present; otherwise it returns the newest completed livestream from the playlist. The application persists live results as before and persists completed results as an offline cache row with video metadata. The frontend renders both `live` and `past` responses in the same livestream area.

## UI

- `live`: embed the video with the title “Watch … live on YouTube”.
- `past`: embed the video with the title “Watch the latest livestream: …”.
- `offline` or lookup error: retain the existing channel and Facebook fallback links.

## Verification

- Provider tests distinguish active, completed, non-embeddable, and older completed videos.
- Application/cache tests verify past data is persisted and returned outside the checking window.
- Frontend end-to-end tests verify the same area renders the past embed and still renders the offline fallback when no archive exists.
