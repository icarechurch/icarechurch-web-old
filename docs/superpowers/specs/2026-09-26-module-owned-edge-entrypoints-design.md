# Module-Owned Supabase Edge Entrypoints

## Status

Proposed design for review.

## Problem

Supabase deploys functions by stable public names, but the current repository still mirrors those names as directories under `supabase/functions/`. The directories contain transport adapters alongside tests, which makes the deployment layout look like a second application layer even though the business implementations already live under `functions/modules/`.

Supabase CLI supports `functions.<function_name>.entrypoint` in `supabase/config.toml`. The custom path is relative to the project root and may point to a TypeScript file anywhere inside the functions tree. This allows public function names to remain stable while module-owned files become the deployment entrypoints.

Reference: <https://supabase.com/docs/guides/local-development/cli/config>

## Goals

- Remove all local function-name deployment directories from `supabase/functions/`.
- Keep the six deployed names and request/response contracts unchanged:
  `activity-logs`, `analytics-data`, `content-data`, `create-user`,
  `user-data`, and `youtube-livestream`.
- Keep each function's transport composition inside the module that owns its behavior.
- Keep shared HTTP, authentication, error, response, and Supabase client utilities in `_shared/` only when they are genuinely cross-cutting.
- Remove the remaining legacy-style YouTube implementation from its deployment directory and place it inside a module.
- Preserve the existing test coverage and add architecture checks for the custom entrypoint mapping.
- Do not create `.gitkeep` files or empty placeholder layers.

## Non-goals

- No database schema or migration changes.
- No frontend API contract changes.
- No renaming of deployed Supabase functions.
- No changes to the remotely managed `create-client` function, which has no local source directory.

## Options considered

### 1. Custom config entrypoints (recommended)

Map each public function name to a module-owned `entrypoint.ts` in `config.toml`. This removes duplicate deployment directories while using a supported Supabase CLI feature. It keeps function names stable and makes module ownership explicit.

### 2. Keep thin deployment adapters

Continue using `functions/<name>/index.ts` as the default CLI convention. This is the smallest change, but it leaves the duplicated function directories and does not satisfy the desired module-owned deployment boundary.

### 3. Use one shared router entrypoint

Route multiple public functions through a common dispatcher. This would reduce entrypoint files, but it would couple unrelated bounded contexts and make function-specific authentication, dependency composition, and tests less clear. It conflicts with the requirement that work stays within one module.

## Architecture

The final function tree will use module-owned entrypoints:

```text
supabase/functions/
├── _shared/
├── modules/
│   ├── analytics/
│   │   └── entrypoint.ts
│   ├── audit/
│   │   └── entrypoint.ts
│   ├── content/
│   │   └── entrypoint.ts
│   ├── identity/
│   │   ├── create-user/
│   │   │   └── entrypoint.ts
│   │   └── user-data/
│   │       └── entrypoint.ts
│   └── youtube-livestream/
│       └── entrypoint.ts
└── tests/
    └── architecture/
```

`supabase/config.toml` will map public names to these paths:

```toml
[functions.activity-logs]
entrypoint = "./functions/modules/audit/entrypoint.ts"

[functions.analytics-data]
entrypoint = "./functions/modules/analytics/entrypoint.ts"

[functions.content-data]
entrypoint = "./functions/modules/content/entrypoint.ts"

[functions.create-user]
entrypoint = "./functions/modules/identity/create-user/entrypoint.ts"

[functions.user-data]
entrypoint = "./functions/modules/identity/user-data/entrypoint.ts"

[functions.youtube-livestream]
entrypoint = "./functions/modules/youtube-livestream/entrypoint.ts"
```

Each entrypoint will own its `Deno.serve` registration, request parsing, route validation, module composition, and HTTP error conversion. It may import generic helpers from `_shared/`, but it will not import another bounded context's application or infrastructure code.

The YouTube files currently beside its deployment entrypoint (`cache.ts`, `schedule.ts`, `types.ts`, and `youtube.ts`) will move beneath `modules/youtube-livestream/`, where the entrypoint and its focused tests can remain together.

## Request flow

```text
Supabase function name
        ↓ config.toml custom entrypoint
module-owned entrypoint.ts
        ↓ shared request/CORS/error utilities
module route dispatcher and composition
        ↓
application use case → domain port → infrastructure adapter
        ↓
HTTP response
```

The request payloads, operation names, response shapes, status codes, environment variables, and public URLs remain unchanged.

## Testing and verification

- Add or update the architecture test to assert that all six configured entrypoints exist, are module-owned, and are the only deployment entrypoints.
- Assert that no `supabase/functions/<public-function-name>/` directories remain for the six functions.
- Preserve and relocate existing function tests with their implementation modules.
- Run the full Deno suite from the repository root: `deno test -A supabase/functions`.
- Run the frontend package's dependent checks, including `npm run test:edge`.
- Validate CLI discovery and deploy from the repository root with `npx supabase@latest functions deploy --project-ref <project-ref>`.
- Confirm the remote function list still contains the same six local function names and that each deployment reports the configured module entrypoint.
- Run `git diff --check` and search for stale deployment-directory references.

## Documentation

Update the README, architecture, development, API, security, component, migration, frontend data-access, audit, and implementation-plan documents to describe module-owned entrypoints and the `config.toml` mapping. The documentation must explicitly distinguish public Supabase function names from private module paths.

## Migration safety

The migration is source-layout and CLI-configuration only. The remote function names remain unchanged, so frontend callers do not need updates. Deployment verification is required before removing the old directories from the final tree.
