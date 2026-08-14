# Frontend Domain Refactor Design

**Date:** 2026-08-14  
**Status:** Approved for planning

## Goal

Refactor the React frontend into explicit application, domain, user-experience, admin-experience, shared, and infrastructure boundaries without changing user-visible behavior.

The refactor must remove god classes—especially `src/hooks/useChurchData.tsx`—and must not leave compatibility shims, duplicate folder structures, or legacy re-export layers behind.

## Approved architecture

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── initialization/
│   └── App.tsx
│
├── domains/
│   ├── auth/
│   ├── events/
│   ├── ministries/
│   ├── sermons/
│   ├── gallery/
│   ├── giving/
│   ├── church-info/
│   ├── service-times/
│   ├── pastors/
│   ├── analytics/
│   └── activity-logs/
│
├── user/
│   ├── home/
│   ├── about/
│   ├── events/
│   ├── ministries/
│   ├── sermons/
│   ├── gallery/
│   ├── giving/
│   ├── contact/
│   └── profile/
│
├── admin/
│   ├── layout/
│   ├── dashboard/
│   ├── users/
│   ├── events/
│   ├── ministries/
│   ├── sermons/
│   ├── gallery/
│   ├── giving/
│   ├── church-info/
│   ├── analytics/
│   └── activity-logs/
│
├── moderator/
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   ├── constants/
│   └── types/
│
└── infrastructure/
    ├── supabase/
    └── leaflet/
```

### Boundary rules

- `domains/` contains business-domain logic shared by user and admin experiences.
- `user/` contains visitor-facing and regular-user pages/components.
- `admin/` contains administrator pages/components, dashboard composition, navigation, and admin layout.
- `moderator/` contains moderator-specific experience code.
- `shared/` contains only generic code that is not owned by one business domain or persona.
- `infrastructure/` contains external-system clients and primitives.
- `app/` composes routes, providers, startup behavior, and the root application; it does not contain domain business logic.
- Every old flat page, hook, component, or service location is removed after its migration slice completes.
- No compatibility re-export files, old-path aliases, duplicate modules, or legacy folder remnants are allowed.

## Domain module shape

Each domain uses focused files instead of a god class:

```text
domains/events/
├── api/
│   └── events.api.ts
├── hooks/
│   └── useEvents.ts
└── model/
    └── events.types.ts
```

The exact files may be split further when a domain has distinct read hooks, mutation hooks, or validation rules, but each file must have one clear responsibility.

Domain API adapters invoke the already-deployed Edge Functions. They do not build Supabase table queries or RPC calls. `infrastructure/supabase` owns the low-level Supabase client, Edge Function transport, native Auth, Storage, and Realtime primitives.

Examples:

- `domains/events/api/events.api.ts` invokes `content-data`.
- `domains/analytics/api/analytics.api.ts` invokes `analytics-data`.
- `domains/activity-logs/api/activity-logs.api.ts` invokes `activity-logs`.
- `domains/auth/api/auth.api.ts` uses the user-data Edge Function for profile/role/permission data and the infrastructure Auth primitive for native sign-in/session operations.
- Generic Storage operations remain infrastructure-owned and are consumed by gallery/admin experiences.

## Experience module shape

User and admin modules consume domain hooks and types but own their presentation and workflows:

```text
user/events/
├── pages/EventsPage.tsx
└── components/

admin/events/
├── pages/AdminEventsPage.tsx
└── components/
```

Admin event forms, sorting interactions, and management-specific components belong under `admin/events`. Public event rendering belongs under `user/events`. A truly reusable event-specific component remains in `domains/events/components` only when both experiences need it; generic controls belong in `shared/components`.

## Application composition

`src/app/App.tsx` will contain composition only. Responsibilities move as follows:

- Route declarations move to `src/app/router/`.
- Provider composition moves to `src/app/providers/`; domain-owned providers may be implemented in their domain and composed here.
- Critical-data loading, offline state, startup progress, and page tracking move to `src/app/initialization/` or the owning domain when they are domain-specific.
- The existing root filename/casing mismatch between `src/App.tsx` and the `src/main.tsx` import is resolved during the application-foundation slice.

Routes remain behaviorally equivalent:

- Public routes resolve to `user/*` pages.
- `/admin` resolves to `admin/dashboard` and its admin layout.
- `/moderator` resolves to `moderator` pages.
- Auth, profile, password-update, and not-found routes resolve to their new ownership modules.

## Data flow

```text
user/admin UI
   ↓
domain hook
   ↓
domain API adapter
   ↓
infrastructure/supabase function transport
   ↓
Supabase Edge Function
```

Frontend source must contain no `.from(...)` table queries or `.rpc(...)` calls. Native Auth, Storage, and Realtime APIs are allowed only through centralized infrastructure wrappers. The existing Cypress architecture guard will be updated to scan the complete new `src/` structure.

## Migration strategy

The refactor uses vertical slices. Each slice is independently checked and committed:

1. Establish `app`, `shared`, and `infrastructure` foundations.
2. Move auth, providers, routing, and initialization.
3. Move user-facing domains: home, about, events, ministries, service times, sermons, gallery, giving, church information, and contact.
4. Move admin domains: events, ministries, service times, sermons, gallery, giving, church information, and admin layout/dashboard composition.
5. Move authenticated areas: users, profile, analytics, activity logs, and moderator experiences.
6. Delete all legacy flat pages/hooks/components and update documentation and architecture guards.

The large `useChurchData.tsx` file is split by domain before it is deleted. Its types, query hooks, mutation hooks, cache keys, and activity-log side effects move with the owning domain; no new aggregate hook replaces it.

## Testing and verification

This is a behavior-preserving refactor, not a visual redesign.

For every slice:

1. Add or strengthen the relevant Cypress characterization/behavior test.
2. Move the implementation and update all imports/routes.
3. Delete the old implementation paths.
4. Run the relevant Cypress specs.
5. Run `npm run test:edge` for Edge-function regression coverage.
6. Run `npm run typecheck`.
7. Run `npm run build:dev`.

Cypress remains the frontend test runner. Deno remains the runtime-specific test runner for Supabase Edge Function modules and exact query-preservation tests.

Success means:

- `useChurchData.tsx` no longer exists.
- No legacy `src/pages`, `src/components/admin`, or generic domain-hook locations remain.
- No frontend table queries or RPCs remain.
- Public, admin, moderator, auth, and profile routes preserve their behavior.
- Domain APIs, hooks, types, and experience UI are independently understandable.
- The repository contains no compatibility shims or duplicate old/new structures.
