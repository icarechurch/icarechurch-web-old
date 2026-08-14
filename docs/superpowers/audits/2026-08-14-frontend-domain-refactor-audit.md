# Frontend Domain Refactor Audit

Date: 2026-08-14  
Branch: `refactor/frontend-domain-50-commits`

## Result

The frontend migration is complete. The source tree now uses vertical slices organized by domain, with application composition in `src/app`, public experiences in `src/user`, privileged experiences in `src/admin` and `src/moderator`, reusable code in `src/shared`, and Supabase/Leaflet adapters in `src/infrastructure`.

```text
src/
├── app/
│   ├── initialization/
│   ├── providers/
│   └── router/
├── domains/
│   ├── activity-logs/
│   ├── analytics/
│   ├── auth/
│   ├── church-info/
│   ├── event-popup/
│   ├── events/
│   ├── gallery/
│   ├── giving/
│   ├── ministries/
│   ├── pastors/
│   ├── sermons/
│   └── service-times/
├── user/
├── admin/
├── moderator/
├── shared/
└── infrastructure/
```

## Route preservation

The application route map retains the existing public paths `/`, `/about`, `/services`, `/ministries`, `/events`, `/sermons`, `/contact`, `/giving`, `/gallery`, `/auth`, `/update-password`, and `/profile`, plus `/admin`, `/moderator`, and the wildcard not-found route. Cypress characterization and smoke specs remain under `cypress/e2e/refactor/`.

## Boundary checks

The following source checks completed with zero matches unless noted:

- `useChurchData`: zero matches.
- Legacy page imports (`@/pages/`): zero matches.
- Legacy admin/moderator component imports: zero matches.
- Legacy hook imports (`@/hooks/`): zero matches.
- Legacy Supabase service imports: zero matches.
- Accidental `PagePage` and generated newline literals: zero matches.
- Frontend `.rpc(` calls: zero matches.
- Frontend table-query `.from(` calls: zero matches. The only remaining `.from(` calls are Supabase Storage operations in `src/infrastructure/supabase/storage.ts`.
- Legacy source locations `src/pages`, `src/components/admin`, `src/components/moderator`, `src/hooks`, and `src/integrations/supabase/services`: no tracked source files remain.

## Verification

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run test:edge` | Passed: 43 passed, 0 failed |
| `npm run build:dev` | Passed; Vite emitted the existing large-chunk warning |
| `npm test` | Cypress Electron runner stalled in this environment and timed out after 60 seconds |
| `npm run test:architecture` | Cypress Electron runner stalled in this environment and timed out after 60 seconds |
| `npm exec -- ultracite check` | Blocked by the existing Biome v2 configuration key `files.ignore`; no source changes were made for this unrelated tooling issue |

The refactor consists of exactly 50 implementation commits, matching the approved plan in `docs/superpowers/plans/2026-08-14-frontend-domain-refactor.md`.
