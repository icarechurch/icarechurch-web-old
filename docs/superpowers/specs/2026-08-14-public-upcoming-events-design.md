# Public Upcoming Events Design

## Goal

Prevent completed events from appearing in the public Upcoming Events listing.

## Behavior

- Public event cards render only events whose status is not `done`.
- Scheduled and postponed events remain visible.
- The admin event experience continues to receive and display all event statuses, including completed events.
- No database query or Edge Function contract changes are required; filtering belongs to the public presentation boundary.

## Implementation and testing

The public events page will derive a filtered list before rendering. A Cypress regression will prove that completed events are omitted while active events remain available. Existing public-route, architecture, typecheck, Edge-function, and build checks must remain green.
