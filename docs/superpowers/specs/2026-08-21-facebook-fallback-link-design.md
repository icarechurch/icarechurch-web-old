# Facebook fallback link design

## Goal

Give visitors a second social destination when the YouTube livestream is offline or temporarily unavailable.

## Behavior

The existing offline/error state in `YouTubeLivestream` continues to show “Visit our YouTube channel” and adds “Visit our Facebook page” beneath it. Both links open the known public Facebook page in a new tab with `rel="noopener noreferrer"`. The live YouTube iframe state is unchanged.

## Testing

The existing Cypress offline-state test will assert the Facebook link URL, target, and rel attributes. The live-state test will continue asserting that no Facebook URL is rendered inside the livestream component.

## Scope

Only the livestream fallback component and its focused Cypress coverage change. No provider calls, Supabase schema, deployment secrets, or Facebook embed behavior are introduced.
