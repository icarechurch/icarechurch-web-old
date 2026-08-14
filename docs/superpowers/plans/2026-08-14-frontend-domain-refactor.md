# Frontend Domain Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the frontend into `app`, `domains`, `user`, `admin`, `moderator`, `shared`, and `infrastructure` boundaries while preserving behavior and removing all legacy locations.

**Architecture:** Business-domain types, hooks, and Edge Function adapters live under `src/domains/<domain>`. User and admin experiences live under `src/user/<domain>` and `src/admin/<domain>`. Application composition lives under `src/app`; generic utilities and UI live under `src/shared`; external clients live under `src/infrastructure`.

**Tech Stack:** React 18, TypeScript, React Router, Cypress, Supabase Edge Functions, Deno, Vite, Tailwind, existing custom query hooks.

## Global Constraints

- Exactly 50 implementation commits are required; do not squash them.
- Every numbered task below produces one real commit with the specified message.
- No compatibility shims, legacy re-export files, duplicate modules, or old folder paths may remain.
- Preserve routes, rendered behavior, API payloads, query keys, mutation semantics, and error behavior.
- No frontend `.from(...)` table queries or `.rpc(...)` calls; domain APIs invoke the existing Edge Functions.
- Cypress is the frontend test runner; Deno is the Edge-function test runner.
- Use a fresh isolated worktree before implementation begins.
- Run `npm run typecheck` after every slice and run the relevant Cypress/Edge checks before committing.
- Keep imports explicit; do not recreate a broad service barrel or an aggregate `useChurchData` replacement.
- Use `git mv`/equivalent tracked renames where possible, then update imports and delete obsolete files in the same task.

## Target boundaries

```text
src/app/{App.tsx,router,providers,initialization}
src/domains/{auth,events,ministries,service-times,sermons,gallery,giving,church-info,pastors,analytics,activity-logs}
src/user/{home,about,events,ministries,sermons,gallery,giving,contact,profile}
src/admin/{layout,dashboard,users,events,ministries,service-times,sermons,gallery,giving,church-info,analytics,activity-logs}
src/moderator/
src/shared/{components,hooks,lib,constants,types}
src/infrastructure/{supabase,leaflet}
```

Every task ends with a focused commit. The commands below are run from the isolated worktree.

---

### Task 01: Add the pre-refactor route characterization suite

**Files:**
- Create: `cypress/e2e/refactor/public-routes.cy.js`
- Create: `cypress/e2e/refactor/protected-routes.cy.js`

- [ ] Add Cypress assertions for the current public paths `/`, `/about`, `/services`, `/ministries`, `/events`, `/sermons`, `/contact`, `/giving`, `/gallery`, and `/auth`.
- [ ] Add protected-route assertions that verify `/admin`, `/moderator`, `/profile`, and `/update-password` resolve to an application page or intentional auth redirect rather than a missing route.
- [ ] Run `npm run test:architecture` and the new specs with the existing Vite server running; record the current behavior as the refactor baseline.
- [ ] Run `npm run typecheck`.
- [ ] Commit: `test: characterize frontend routes before refactor`

### Task 02: Move the generated UI component library to shared

**Files:**
- Move: `src/components/ui/*` → `src/shared/components/ui/*`
- Modify: every import of `@/components/ui/*`

- [ ] Move all existing shadcn-style UI components without changing exports or JSX behavior.
- [ ] Update every consumer import to `@/shared/components/ui/*`.
- [ ] Run `rg -n "@/components/ui|src/components/ui" src cypress` and confirm no old UI path remains.
- [ ] Run `npm run typecheck`.
- [ ] Commit: `refactor: move shared ui components`

### Task 03: Move shared layout components

**Files:**
- Move: `src/components/layout/Layout.tsx` → `src/shared/components/layout/Layout.tsx`
- Move: `src/components/layout/Navbar.tsx` → `src/shared/components/layout/Navbar.tsx`
- Move: `src/components/layout/Footer.tsx` → `src/shared/components/layout/Footer.tsx`
- Modify: public pages importing layout components

- [ ] Update layout imports to `@/shared/components/layout/*`.
- [ ] Preserve the existing navigation links, footer content, responsive behavior, and layout props.
- [ ] Run the public route Cypress specs and `npm run typecheck`.
- [ ] Commit: `refactor: move shared layout components`

### Task 04: Move cross-cutting shared components

**Files:**
- Move: `src/components/ErrorBoundary.tsx` → `src/shared/components/system/ErrorBoundary.tsx`
- Move: `src/components/AppLoadingScreen.tsx` → `src/shared/components/system/AppLoadingScreen.tsx`
- Move: `src/components/ScrollToTop.tsx` → `src/shared/components/navigation/ScrollToTop.tsx`
- Move: `src/components/NavLink.tsx` → `src/shared/components/navigation/NavLink.tsx`
- Move: `src/components/SectionNav.tsx` → `src/shared/components/navigation/SectionNav.tsx`
- Modify: imports in `src/App.tsx`, pages, and layouts

- [ ] Keep system and navigation components generic; do not move domain-specific components into shared.
- [ ] Update imports and run the public route specs.
- [ ] Run `npm run typecheck`.
- [ ] Commit: `refactor: move cross-cutting components to shared`

### Task 05: Move generic hooks and query primitives

**Files:**
- Move: `src/hooks/simple-query-hooks.ts` → `src/shared/hooks/simple-query-hooks.ts`
- Move: `src/hooks/use-mobile.tsx` → `src/shared/hooks/use-mobile.tsx`
- Move: `src/hooks/use-toast.ts` → `src/shared/hooks/use-toast.ts`
- Modify: all imports of these hooks

- [ ] Preserve the custom query/mutation hook public signatures and cache behavior.
- [ ] Update every import to `@/shared/hooks/*`.
- [ ] Run `rg -n "@/hooks/(simple-query-hooks|use-mobile|use-toast)" src` and confirm zero matches.
- [ ] Run `npm run typecheck`.
- [ ] Commit: `refactor: move generic hooks to shared`

### Task 06: Move shared constants, helpers, and common types

**Files:**
- Move: `src/constant/*` → `src/shared/constants/*`
- Move: generic files from `src/lib/*` → `src/shared/lib/*`
- Create: `src/shared/types/*` only for types used by at least two domains/experiences
- Modify: imports of constants and helpers

- [ ] Keep domain constants beside their owning domain; move only generic constants to `shared/constants`.
- [ ] Do not place feature-specific types in `shared/types`.
- [ ] Run `npm run typecheck` and `npm run build:dev`.
- [ ] Commit: `refactor: organize shared constants and utilities`

### Task 07: Move the Supabase client and generated database types to infrastructure

**Files:**
- Move: `src/integrations/supabase/client.ts` → `src/infrastructure/supabase/client.ts`
- Move: `src/integrations/supabase/types.ts` → `src/infrastructure/supabase/types.ts`
- Modify: imports of `client` and `types`

- [ ] Preserve the existing Supabase URL/key configuration and generated type exports.
- [ ] Update imports to `@/infrastructure/supabase/*`.
- [ ] Run the frontend architecture guard source scan and `npm run typecheck`.
- [ ] Commit: `refactor: move supabase client infrastructure`

### Task 08: Move the Edge Function transport and native integrations

**Files:**
- Move: `src/integrations/supabase/functions.ts` → `src/infrastructure/supabase/functions.ts`
- Move: `src/integrations/supabase/storage.service.ts` → `src/infrastructure/supabase/storage.ts`
- Move: `src/integrations/leaflet/*` → `src/infrastructure/leaflet/*`
- Modify: domain and component imports

- [ ] Preserve `invokeFunction`, native Storage behavior, and Leaflet integration behavior.
- [ ] Keep transport code generic; do not move domain operation names into infrastructure.
- [ ] Run `npm run typecheck` and the relevant gallery/admin smoke spec.
- [ ] Commit: `refactor: centralize external integrations`

### Task 09: Move the root application component

**Files:**
- Move: `src/App.tsx` → `src/app/App.tsx`
- Modify: `src/main.tsx`

- [ ] Update the root import to use the correctly cased `./app/App` path.
- [ ] Keep the existing composition temporarily intact while changing only ownership and imports.
- [ ] Run `npm run build:dev` and the public route specs.
- [ ] Commit: `refactor: move root app composition`

### Task 10: Add the application route module

**Files:**
- Create: `src/app/router/routes.tsx`
- Modify: `src/app/App.tsx`

- [ ] Move the existing `Routes`/`Route` declarations into `routes.tsx` without changing paths, route elements, or wildcard behavior.
- [ ] Export one `AppRoutes` component consumed by `App.tsx`.
- [ ] Run Task 01 route specs and `npm run typecheck`.
- [ ] Commit: `refactor: isolate application routes`

### Task 11: Add application provider composition

**Files:**
- Create: `src/app/providers/AppProviders.tsx`
- Modify: `src/app/App.tsx`

- [ ] Move `TooltipProvider`, `Toaster`, Sonner, and the auth provider composition into `AppProviders`.
- [ ] Keep provider order unchanged so context behavior does not change.
- [ ] Run `npm run typecheck` and the auth route Cypress spec.
- [ ] Commit: `refactor: isolate application providers`

### Task 12: Isolate application initialization

**Files:**
- Create: `src/app/initialization/AppInitializer.tsx`
- Move or split: `src/hooks/useInternetStatus.ts` → `src/app/initialization/useInternetStatus.ts`
- Move or split: `src/hooks/useLoadingProgress.ts` → `src/app/initialization/useLoadingProgress.ts`
- Move: `src/components/PageTracker.tsx` → `src/app/initialization/PageTracker.tsx`
- Modify: `src/app/App.tsx` and imports

- [ ] Keep critical data loading, offline state, progress calculation, Bible verse display, and page tracking behavior identical.
- [ ] Do not reintroduce domain data access into `AppInitializer`; it may consume domain hooks only.
- [ ] Run public route specs, `npm run typecheck`, and `npm run build:dev`.
- [ ] Commit: `refactor: isolate application initialization`

### Task 13: Create the auth domain model and API boundary

**Files:**
- Create: `src/domains/auth/model/auth.types.ts`
- Create: `src/domains/auth/api/auth.api.ts`
- Move/adapt: `src/integrations/supabase/services/auth.service.ts`
- Modify: imports of `UserRole`, `UserRoleData`, and auth service methods

- [ ] Preserve `UserRole`, allowed-tab fallback behavior, and the deployed `user-data` resource/operation contracts.
- [ ] Keep low-level Supabase Auth primitives in `src/infrastructure/supabase`; keep role/permission data access in the auth domain API.
- [ ] Add or update a Cypress auth characterization test for authenticated versus unauthenticated navigation.
- [ ] Run `npm run test:edge`, the auth Cypress spec, and `npm run typecheck`.
- [ ] Commit: `refactor: establish auth domain boundaries`

### Task 14: Move the auth provider and hook

**Files:**
- Move: `src/hooks/useAuth.tsx` → `src/domains/auth/providers/AuthProvider.tsx`
- Create: `src/domains/auth/hooks/useAuth.ts`
- Modify: `src/app/providers/AppProviders.tsx`, `TabGuard`, and auth consumers

- [ ] Preserve session subscription, role loading, stale-request protection, `isAdmin`, `isModerator`, and `roleError` behavior.
- [ ] Keep `useAuth` as the only consumer-facing auth context hook.
- [ ] Run auth Cypress specs and `npm run typecheck`.
- [ ] Commit: `refactor: move auth provider into auth domain`

### Task 15: Move authentication pages and route-specific auth UI

**Files:**
- Move: `src/pages/Auth.tsx` → `src/user/auth/pages/AuthPage.tsx`
- Move: `src/pages/UpdatePassword.tsx` → `src/user/auth/pages/UpdatePasswordPage.tsx`
- Move: `src/pages/auth/TabGuard.tsx` → `src/admin/layout/TabGuard.tsx`
- Modify: `src/app/router/routes.tsx`

- [ ] Preserve sign-in, sign-up, password-update, validation, redirects, and error toasts.
- [ ] Update route elements to the new page paths and delete the old auth page files.
- [ ] Run auth Cypress specs and `npm run typecheck`.
- [ ] Commit: `refactor: move authentication experiences`

### Task 16: Create the events domain model

**Files:**
- Create: `src/domains/events/model/events.types.ts`
- Move types: `Event`, `EventInsert` from `src/hooks/useChurchData.tsx`
- Modify: consumers of event types

- [ ] Preserve event status unions, insert/update shapes, and nullable fields exactly.
- [ ] Add a Cypress event page assertion if the existing suite does not cover event rendering.
- [ ] Run the event spec and `npm run typecheck`.
- [ ] Commit: `refactor: extract events domain types`

### Task 17: Create the events API adapter

**Files:**
- Create: `src/domains/events/api/events.api.ts`
- Move/adapt: `src/integrations/supabase/services/events.service.ts`
- Modify: event service imports

- [ ] Preserve all `content-data` resource/operation payloads and return types.
- [ ] Keep this module free of Supabase query builders; it calls `invokeFunction` from infrastructure.
- [ ] Run the public event Cypress spec and `npm run typecheck`.
- [ ] Commit: `refactor: isolate events api adapter`

### Task 18: Create events hooks and remove event code from the god hook

**Files:**
- Create: `src/domains/events/hooks/useEvents.ts`
- Create: `src/domains/events/hooks/useEventMutations.ts`
- Modify: `src/hooks/useChurchData.tsx`
- Modify: event page/admin imports

- [ ] Move event query keys, read hook, mutation hooks, invalidation, and activity-log side effects into focused files.
- [ ] Do not change mutation callback messages or entity metadata.
- [ ] Run event Cypress specs and `npm run typecheck`.
- [ ] Commit: `refactor: split events hooks from church data`

### Task 19: Move the public events experience

**Files:**
- Move: `src/pages/Events.tsx` → `src/user/events/pages/EventsPage.tsx`
- Create/move: `src/user/events/components/*`
- Modify: route imports and event-specific component imports

- [ ] Preserve page metadata, layout, loading state, empty state, formatting, and event links.
- [ ] Run the public route characterization suite and `npm run build:dev`.
- [ ] Commit: `refactor: move public events experience`

### Task 20: Move the admin events experience

**Files:**
- Move: `src/components/admin/AdminEvents.tsx` → `src/admin/events/pages/AdminEventsPage.tsx`
- Move: `src/components/admin/adminconstants/events/adminevents.ts` → `src/admin/events/events.constants.ts`
- Modify: admin dashboard imports

- [ ] Preserve event forms, sorting, dialogs, deletion confirmation, toasts, and role access behavior.
- [ ] Run the admin events Cypress spec and `npm run typecheck`.
- [ ] Commit: `refactor: move admin events experience`

### Task 21: Create the ministries domain model, API, and hooks

**Files:**
- Create: `src/domains/ministries/model/ministries.types.ts`
- Create: `src/domains/ministries/api/ministries.api.ts`
- Create: `src/domains/ministries/hooks/useMinistries.ts`
- Create: `src/domains/ministries/hooks/useMinistryMutations.ts`
- Move/adapt ministry code from `src/hooks/useChurchData.tsx` and `src/integrations/supabase/services/ministries.service.ts`

- [ ] Preserve ministry category types, sort-order mutation behavior, cache keys, and activity logging.
- [ ] Run the ministry Cypress spec and `npm run typecheck`.
- [ ] Commit: `refactor: establish ministries domain`

### Task 22: Move user ministries UI

**Files:**
- Move: `src/pages/Ministries.tsx` → `src/user/ministries/pages/MinistriesPage.tsx`
- Move: `src/components/CareGrid.tsx` → `src/user/ministries/components/CareGrid.tsx`
- Modify: route and imports

- [ ] Keep ministry cards, category filtering, links, and loading behavior unchanged.
- [ ] Run public ministry Cypress specs and `npm run typecheck`.
- [ ] Commit: `refactor: move user ministries experience`

### Task 23: Move admin ministries UI

**Files:**
- Move: `src/components/admin/AdminMinistries.tsx` → `src/admin/ministries/pages/AdminMinistriesPage.tsx`
- Move: `src/components/admin/SortableMinistryCard.tsx` → `src/admin/ministries/components/SortableMinistryCard.tsx`
- Move: `src/components/admin/ImageUpload.tsx` → `src/shared/components/media/ImageUpload.tsx` if it remains generic
- Modify: admin dashboard and storage imports

- [ ] Preserve drag-and-drop ordering, image upload, dialogs, validation, and activity logging.
- [ ] Run the admin ministry Cypress spec and `npm run typecheck`.
- [ ] Commit: `refactor: move admin ministries experience`

### Task 24: Create service-times domain and user experience

**Files:**
- Create: `src/domains/service-times/model/service-times.types.ts`
- Create: `src/domains/service-times/api/service-times.api.ts`
- Create: `src/domains/service-times/hooks/useServiceTimes.ts`
- Move: `src/pages/Services.tsx` → `src/user/service-times/pages/ServicesPage.tsx`
- Move/adapt service-time code from `src/hooks/useChurchData.tsx` and `src/integrations/supabase/services/service-times.service.ts`

- [ ] Preserve query key `service_times`, sort-order operations, public service cards, and metadata.
- [ ] Run the public services Cypress spec and `npm run typecheck`.
- [ ] Commit: `refactor: establish service times domain and user experience`

### Task 25: Move admin service-times UI

**Files:**
- Move: `src/components/admin/AdminServiceTimes.tsx` → `src/admin/service-times/pages/AdminServiceTimesPage.tsx`
- Move: `src/components/admin/adminconstants/servicetimes/adminservicetimes.ts` → `src/admin/service-times/service-times.constants.ts`
- Modify: admin dashboard imports

- [ ] Preserve service-time CRUD, sorting, form validation, and toast behavior.
- [ ] Run admin service-time Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move admin service times experience`

### Task 26: Create sermons domain and user experience

**Files:**
- Create: `src/domains/sermons/model/sermons.types.ts`
- Create: `src/domains/sermons/api/sermons.api.ts`
- Create: `src/domains/sermons/hooks/useSermons.ts`
- Move: `src/pages/Sermons.tsx` → `src/user/sermons/pages/SermonsPage.tsx`
- Move/adapt sermon code from `src/hooks/useChurchData.tsx` and `src/integrations/supabase/services/sermons.service.ts`

- [ ] Preserve latest-sermon behavior, sermon date formatting, featured state, and media links.
- [ ] Run public sermon Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: establish sermons domain and user experience`

### Task 27: Move admin sermons UI

**Files:**
- Move: `src/components/admin/AdminSermons.tsx` → `src/admin/sermons/pages/AdminSermonsPage.tsx`
- Create: `src/admin/sermons/sermons.constants.ts` from the inline initial sermon form data in `AdminSermons.tsx`
- Modify: admin dashboard imports

- [ ] Preserve sermon CRUD, featured toggle, media fields, dialogs, and activity logging.
- [ ] Run admin sermon Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move admin sermons experience`

### Task 28: Create gallery domain and user experience

**Files:**
- Create: `src/domains/gallery/model/gallery.types.ts`
- Create: `src/domains/gallery/api/gallery.api.ts`
- Create: `src/domains/gallery/hooks/useGallery.ts`
- Move: `src/pages/Gallery.tsx` → `src/user/gallery/pages/GalleryPage.tsx`
- Move/adapt gallery code from `src/hooks/useChurchData.tsx` and `src/integrations/supabase/services/gallery.service.ts`

- [ ] Preserve gallery empty/loading states, image metadata, and query keys.
- [ ] Consume Storage through `infrastructure/supabase/storage.ts`, not a direct client import.
- [ ] Run public gallery Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: establish gallery domain and user experience`

### Task 29: Move admin gallery UI

**Files:**
- Move: `src/components/admin/AdminGallery.tsx` → `src/admin/gallery/pages/AdminGalleryPage.tsx`
- Move gallery constants to `src/admin/gallery/gallery.constants.ts`
- Modify: storage, domain hook, and admin dashboard imports

- [ ] Preserve file selection, upload/delete workflow, bucket naming, progress state, and logging.
- [ ] Run admin gallery Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move admin gallery experience`

### Task 30: Create giving domain and user experience

**Files:**
- Create: `src/domains/giving/model/giving.types.ts`
- Create: `src/domains/giving/api/giving.api.ts`
- Create: `src/domains/giving/hooks/useGiving.ts`
- Move: `src/pages/Giving.tsx` → `src/user/giving/pages/GivingPage.tsx`
- Move: `src/components/giving/*` → `src/user/giving/components/*`
- Move/adapt `src/hooks/useGiving.ts` and `src/integrations/supabase/services/giving.service.ts`

- [ ] Preserve giving settings reads, update invalidation, QR download, external links, and fallback rendering.
- [ ] Run public giving Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: establish giving domain and user experience`

### Task 31: Move admin giving UI

**Files:**
- Move: `src/components/admin/AdminGiving.tsx` → `src/admin/giving/pages/AdminGivingPage.tsx`
- Move: `src/components/admin/admingiving/*` → `src/admin/giving/components/*`
- Move: `src/components/admin/adminconstants/giving/admingiving.ts` → `src/admin/giving/giving.constants.ts`
- Modify: admin dashboard and domain hook imports

- [ ] Preserve QR upload, platform settings, form initialization, update state, and toast behavior.
- [ ] Run admin giving Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move admin giving experience`

### Task 32: Create church-info and pastors domains

**Files:**
- Create: `src/domains/church-info/model/church-info.types.ts`
- Create: `src/domains/church-info/api/church-info.api.ts`
- Create: `src/domains/church-info/hooks/useChurchInfo.ts`
- Create: `src/domains/pastors/model/pastors.types.ts`
- Create: `src/domains/pastors/api/pastors.api.ts`
- Create: `src/domains/pastors/hooks/usePastors.ts`
- Move/adapt related code from `src/hooks/useChurchData.tsx` and service files

- [ ] Preserve church singleton behavior, pastor sorting, CRUD, and activity logs.
- [ ] Run `npm run test:edge` and `npm run typecheck`.
- [ ] Commit: `refactor: establish church info and pastors domains`

### Task 33: Move public home, about, and contact experiences

**Files:**
- Move: `src/pages/Index.tsx` → `src/user/home/pages/HomePage.tsx`
- Move: `src/pages/About.tsx` → `src/user/about/pages/AboutPage.tsx`
- Move: `src/pages/Contact.tsx` → `src/user/contact/pages/ContactPage.tsx`
- Move: `src/components/Map.tsx` → `src/user/contact/components/Map.tsx`
- Move: `src/components/FacebookLiveEmbed.tsx` → `src/user/sermons/components/FacebookLiveEmbed.tsx`
- Move: `src/pages/pageconstants/MissionVision.tsx` → `src/user/about/components/MissionVision.tsx`
- Modify: routes and imports

- [ ] Preserve church information loading, map behavior, live embed behavior, metadata, and section navigation.
- [ ] Run the public route characterization suite and `npm run build:dev`.
- [ ] Commit: `refactor: move public home about and contact experiences`

### Task 34: Move admin church-info and pastor UI

**Files:**
- Move: `src/components/admin/AdminChurchInfo.tsx` → `src/admin/church-info/pages/AdminChurchInfoPage.tsx`
- Move: `src/components/admin/adminconstants/churchinfo/*` → `src/admin/church-info/*`
- Modify: admin dashboard and domain imports

- [ ] Preserve church information forms, pastor dialogs, image upload, and sorting.
- [ ] Run admin church-info Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move admin church info experience`

### Task 35: Create event-popup domain and move popup UI

**Files:**
- Create: `src/domains/event-popup/model/event-popup.types.ts`
- Create: `src/domains/event-popup/api/event-popup.api.ts`
- Create: `src/domains/event-popup/hooks/useEventPopup.ts`
- Move: `src/components/EventPopup.tsx` → `src/user/home/components/EventPopup.tsx`
- Move/adapt `src/hooks/useEventPopup.ts`

- [ ] Preserve singleton settings, missing-row fallback, popup visibility, and event link behavior.
- [ ] Run home route Cypress coverage, `npm run test:edge`, and `npm run typecheck`.
- [ ] Commit: `refactor: isolate event popup domain`

### Task 36: Create analytics domain

**Files:**
- Create: `src/domains/analytics/model/analytics.types.ts`
- Create: `src/domains/analytics/api/analytics.api.ts`
- Create: `src/domains/analytics/hooks/useAnalytics.ts`
- Move/adapt: `src/hooks/useAnalytics.ts`
- Move/adapt: `src/integrations/supabase/services/analytics.service.ts`
- Move: `src/components/admin/adminconstants/analytics/*` → `src/admin/analytics/analytics.constants.ts`

- [ ] Preserve consent handling, browser/session IDs, page tracking, client-side aggregation, cache keys, and fallback data.
- [ ] Keep Edge Function transport in the domain API and browser-only identifiers in the hook/initialization boundary.
- [ ] Run analytics Cypress coverage, `npm run test:edge`, and `npm run typecheck`.
- [ ] Commit: `refactor: establish analytics domain`

### Task 37: Move admin and moderator analytics UI

**Files:**
- Move: `src/components/admin/AdminAnalytics.tsx` → `src/admin/analytics/pages/AdminAnalyticsPage.tsx`
- Move: `src/components/moderator/ModeratorAnalytics.tsx` → `src/moderator/analytics/ModeratorAnalyticsPage.tsx`
- Modify: analytics constants and domain hook imports

- [ ] Preserve charts, date windows, loading states, recent visits, and content analytics display.
- [ ] Run admin/moderator Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move analytics experiences`

### Task 38: Create activity-logs domain and move admin logs UI

**Files:**
- Create: `src/domains/activity-logs/model/activity-logs.types.ts`
- Create: `src/domains/activity-logs/api/activity-logs.api.ts`
- Create: `src/domains/activity-logs/hooks/useActivityLogs.ts`
- Move/adapt: `src/hooks/useLogs.ts`
- Move: `src/integrations/supabase/loggingTypes.ts` → `src/domains/activity-logs/model/logging.types.ts`
- Move: `src/components/admin/AdminLogs.tsx` → `src/admin/activity-logs/pages/AdminLogsPage.tsx`
- Move: `src/components/admin/adminconstants/logging/*` → `src/admin/activity-logs/logging.constants.ts`

- [ ] Preserve filters, pagination, summaries, clear behavior, PDF export, and silent logging failure behavior.
- [ ] Run admin logs Cypress coverage, `npm run test:edge`, and `npm run typecheck`.
- [ ] Commit: `refactor: establish activity logs domain`

### Task 39: Create profile domain and move profile experience

**Files:**
- Create: `src/domains/auth/model/profile.types.ts`
- Create: `src/domains/auth/api/profile.api.ts`
- Create: `src/domains/auth/hooks/useProfile.ts`
- Move: `src/pages/Profile.tsx` → `src/user/profile/pages/ProfilePage.tsx`
- Move: `src/hooks/useProfileUpdater.ts` → `src/domains/auth/hooks/useProfileUpdater.ts`
- Move/adapt: `src/integrations/supabase/services/profiles.service.ts`

- [ ] Preserve profile read/update, password update through native Auth, validation, and error messages.
- [ ] Run profile/auth Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: establish profile domain and experience`

### Task 40: Create users domain and move admin users UI

**Files:**
- Create: `src/domains/auth/api/users.api.ts`
- Create: `src/domains/auth/model/users.types.ts`
- Move: `src/components/admin/AdminUsers.tsx` → `src/admin/users/pages/AdminUsersPage.tsx`
- Move/adapt: `src/integrations/supabase/services/admin.service.ts`
- Move/adapt: `src/integrations/supabase/services/users.service.ts`

- [ ] Preserve user list/role merge behavior, profile editing, role replacement, deletion, and notifications.
- [ ] Keep role authorization decisions server-side through the existing Edge Function contract.
- [ ] Run admin users Cypress coverage, `npm run test:edge`, and `npm run typecheck`.
- [ ] Commit: `refactor: establish users domain and admin experience`

### Task 41: Move admin layout and navigation

**Files:**
- Move: `src/components/admin/AdminSidebar.tsx` → `src/admin/layout/AdminSidebar.tsx`
- Move: `src/pages/pageconstants/admin-tabs.ts` → `src/admin/layout/admin-tabs.ts`
- Create: `src/admin/layout/AdminLayout.tsx`
- Modify: admin route and tab imports

- [ ] Preserve role-based tab visibility, mobile sidebar behavior, sign-out, and navigation paths.
- [ ] Run admin navigation Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: establish admin layout boundary`

### Task 42: Move admin dashboard composition

**Files:**
- Move: `src/pages/Admin.tsx` → `src/admin/dashboard/AdminDashboardPage.tsx`
- Create: `src/admin/dashboard/AdminDashboardContent.tsx` and move the embedded tab composition into it
- Modify: route, layout, and all admin screen imports

- [ ] Preserve active-tab selection, loading/error behavior, route access, and dashboard layout.
- [ ] Ensure dashboard composition imports admin pages, not domain internals or old component paths.
- [ ] Run admin Cypress coverage and `npm run build:dev`.
- [ ] Commit: `refactor: move admin dashboard composition`

### Task 43: Move moderator layout and experience

**Files:**
- Move: `src/pages/Moderator.tsx` → `src/moderator/pages/ModeratorPage.tsx`
- Move: `src/components/moderator/ModeratorSidebar.tsx` → `src/moderator/layout/ModeratorSidebar.tsx`
- Modify: moderator analytics imports and route

- [ ] Preserve moderator access checks, sidebar navigation, sign-out, and analytics display.
- [ ] Run moderator Cypress coverage and `npm run typecheck`.
- [ ] Commit: `refactor: move moderator experience`

### Task 44: Complete user experience migration and remove the pages directory

**Files:**
- Move: `src/pages/NotFound.tsx` → `src/user/not-found/pages/NotFoundPage.tsx`
- Modify: `src/app/router/routes.tsx`

- [ ] Run `rg --files src/pages` and ensure the directory is empty before removing it.
- [ ] Run all public/auth/protected Cypress route specs and `npm run typecheck`.
- [ ] Commit: `refactor: remove legacy pages directory`

### Task 45: Finish domain hook extraction and delete useChurchData

**Files:**
- Modify: all remaining domain consumers
- Delete: `src/hooks/useChurchData.tsx`
- Delete: the remaining domain-specific files under `src/hooks` after Tasks 13–43 have moved their listed hooks

- [ ] Run `rg -n "useChurchData|from \"@/hooks/useChurchData\"|from \"\./useChurchData\" src` and confirm zero matches.
- [ ] Verify each domain has its own model, API, and hook ownership rather than a replacement aggregate hook.
- [ ] Run `npm run typecheck`, relevant Cypress specs, and `npm run test:edge`.
- [ ] Commit: `refactor: delete church data god hook`

### Task 46: Remove legacy admin components and service barrels

**Files:**
- Delete: `src/components/admin/*`
- Delete: `src/components/moderator/*` after Task 43
- Delete: `src/integrations/supabase/services/index.ts`
- Modify: every remaining import from old component/service paths

- [ ] Run `rg -n "components/admin|components/moderator|integrations/supabase/services|@/pages|@/hooks" src` and remove every obsolete match except approved shared/infrastructure paths.
- [ ] Run `npm run typecheck` and the full admin/moderator Cypress specs.
- [ ] Commit: `refactor: remove legacy admin and service locations`

### Task 47: Complete infrastructure/shared import enforcement

**Files:**
- Modify: `cypress.config.js`
- Modify: `cypress/e2e/architecture/frontend-data-access.cy.js`
- Create: `cypress/e2e/architecture/frontend-boundaries.cy.js`

- [ ] Extend the Cypress source scan to cover all new `src/` directories.
- [ ] Assert there are no imports from deleted paths, no frontend `.from(...)`/`.rpc(...)` calls, and no `domains/*` import from `user/*` or `admin/*`.
- [ ] Run `npm run test:architecture` and `npm run typecheck`.
- [ ] Commit: `test: enforce frontend architecture boundaries`

### Task 48: Add full public/admin/moderator Cypress smoke coverage

**Files:**
- Modify: `cypress/e2e/user/index/index.cy.js`
- Modify: `cypress/e2e/user/gallery/gallery.cy.js`
- Modify: existing admin and moderator Cypress specs
- Create: missing focused specs under `cypress/e2e/refactor/*`

- [ ] Remove invalid skips/typos encountered during migration and assert stable user-visible outcomes rather than implementation details.
- [ ] Cover at least home, gallery, auth, admin navigation, user management, and moderator navigation.
- [ ] Run the full Cypress suite with the app server running.
- [ ] Commit: `test: complete frontend experience smoke coverage`

### Task 49: Update architecture documentation and developer commands

**Files:**
- Modify: `docs/frontend-data-access.md`
- Modify: `README.md` if it documents the old `src/` structure or test commands
- Modify: `package.json` only if a verified refactor command is missing

- [ ] Document `domains/` rather than `features/`, the user/admin split, the no-legacy rule, and the exact test commands.
- [ ] Keep `npm test` as the Cypress command, `npm run test:architecture` as the source-boundary command, and `npm run test:edge` as the Edge command.
- [ ] Run `npm run typecheck`, `npm run test:edge`, and `npm run build:dev`.
- [ ] Commit: `docs: document frontend domain architecture`

### Task 50: Final refactor audit and committed completion marker

**Files:**
- Create: `docs/superpowers/audits/2026-08-14-frontend-domain-refactor-audit.md`

- [ ] Record the final directory tree, route preservation result, test commands, and the zero-match checks for `useChurchData`, old page/component paths, frontend `.from(...)`, and frontend `.rpc(...)`.
- [ ] Run the complete verification sequence:

```text
npm test
npm run test:architecture
npm run test:edge
npm run typecheck
npm run build:dev
```

- [ ] Confirm `git status --short` contains only intentional user changes before committing.
- [ ] Commit: `refactor: complete frontend domain migration`

## Final commit count

The implementation must contain exactly the 50 commits listed above, in order, in addition to the already committed design and planning documents. Do not squash, reorder, or replace them with one aggregate commit.
