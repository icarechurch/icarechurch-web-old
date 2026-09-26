#  I Care Church Website

## Supabase Edge Function modules

Supabase Edge Functions use a MeatLens-style modular monolith layout. Public function names remain stable in `supabase/config.toml`, while their custom entrypoints live inside `supabase/functions/modules/`: audit, analytics, content, identity, and YouTube. Modules own domain ports, application use cases, infrastructure repositories, and presentation controllers. Deployed names and request contracts remain stable. Legacy query/handler implementation files are not used. Empty layers are omitted and `.gitkeep` placeholders are not created.

A modern, full-featured church website built with React, TypeScript, and Supabase. This application provides a comprehensive platform for church members and visitors to stay connected, view events, watch sermons, and engage with the church community.

## Project Structure

icarecenter-frontend/
+-- icarecenter-frontend/src/
    +-- app/            # Composition, providers, initialization, routes
    +-- domains/        # Business domains: models, APIs, hooks
    +-- user/           # Public and authenticated user experiences
    +-- admin/          # Administrator experiences
    +-- moderator/      # Moderator experiences
    +-- shared/         # Generic UI, layout, hooks, constants, utilities
    +-- infrastructure/ # Supabase, Storage, and Leaflet integrations

supabase/
+-- functions/      # Supabase Edge Functions
+-- migrations/     # Database migrations

icarecenter-test/
+-- e2e/             # Cypress browser tests
+-- support/         # Cypress support files

The `content-data` Supabase Edge Function keeps its public name through the
`[functions.content-data]` mapping in `supabase/config.toml`. Its custom
entrypoint is `supabase/functions/modules/content/entrypoint.ts`, and its
implementation is the private modular-monolith-style module at
`supabase/functions/modules/content/`, composed by resource-owned
domain ports, application use cases, infrastructure repositories, presentation
controllers, and focused tests. External code imports only
`supabase/functions/modules/content/index.ts`.

Unused layers are omitted. Empty directories and `.gitkeep` placeholders are
not created.

## Local development

Install dependencies from `icarecenter-frontend/`, then run the development
server from the repository root or the frontend directory:

```bash
npm run dev
```

The root command delegates to `icarecenter-frontend/`.

The Edge Function test lane runs from `icarecenter-frontend/` with
`npm run test:edge`; it covers the content module, module-owned entrypoints, and
other Edge Functions without requiring a remote Supabase deployment.

## Documentations/DEVELOPMENT.md#troubleshooting)

---

**Made with ❤️ for the church community**
