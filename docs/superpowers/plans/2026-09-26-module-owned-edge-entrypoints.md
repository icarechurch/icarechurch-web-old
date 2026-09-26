# Module-Owned Edge Entrypoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** Remove all public-function deployment directories and deploy all six local Supabase Edge Functions through module-owned custom entrypoints.

**Architecture:** `supabase/config.toml` will preserve public function names while mapping each name to an `entrypoint.ts` inside its owning module. Transport composition and `Deno.serve` registration move into those module entrypoints; `_shared/` remains cross-cutting only. YouTube implementation files and tests move into `modules/youtube-livestream/`.

**Tech Stack:** Supabase CLI 2.x, Deno, TypeScript, TOML, GitHub Actions, Ultracite/Biome.

## Global Constraints

- Keep deployed names and request/response contracts unchanged.
- Use custom entrypoints relative to the project root.
- Do not create `.gitkeep` files or empty placeholder layers.
- Do not change migrations or frontend API contracts.
- Keep module boundaries isolated; modules may use `_shared/` but not another bounded context.

---

### Task 1: Add the failing architecture contract

**Files:**
- Modify: `supabase/functions/tests/architecture/edge-module-boundaries.test.ts`

- [x] **Step 1: Add the expected mapping before production changes.**

Use this map:

`@ts
const deploymentEntrypoints = {
  "activity-logs": "modules/audit/entrypoint.ts",
  "analytics-data": "modules/analytics/entrypoint.ts",
  "content-data": "modules/content/entrypoint.ts",
  "create-user": "modules/identity/create-user/entrypoint.ts",
  "user-data": "modules/identity/user-data/entrypoint.ts",
  "youtube-livestream": "modules/youtube-livestream/entrypoint.ts",
} as const;
`

Assert that `config.toml` contains each function section and exact entrypoint, each module entrypoint exists, and none of the six public function directories exists. Add `youtube-livestream` to module roots and replace adapter-specific assertions with module-entrypoint assertions.

- [x] **Step 2: Verify the test fails for the intended reason.**

Run:

`powershell
deno test -A supabase/functions/tests/architecture/edge-module-boundaries.test.ts
`

Expected: failure for missing mappings/module entrypoints and existing public function directories.

### Task 2: Move the five modular adapters into their modules

**Files:**
- Move `activity-logs/index.ts` → `modules/audit/entrypoint.ts`
- Move `analytics-data/index.ts` → `modules/analytics/entrypoint.ts`
- Move `content-data/index.ts` → `modules/content/entrypoint.ts`
- Move `create-user/index.ts` → `modules/identity/create-user/entrypoint.ts`
- Move `user-data/index.ts` → `modules/identity/user-data/entrypoint.ts`
- Move the existing tests from those directories into the owning module directories.

- [x] **Step 1: Perform Git-aware production moves.**

`powershell
git mv supabase/functions/activity-logs/index.ts supabase/functions/modules/audit/entrypoint.ts
git mv supabase/functions/analytics-data/index.ts supabase/functions/modules/analytics/entrypoint.ts
git mv supabase/functions/content-data/index.ts supabase/functions/modules/content/entrypoint.ts
git mv supabase/functions/create-user/index.ts supabase/functions/modules/identity/create-user/entrypoint.ts
git mv supabase/functions/user-data/index.ts supabase/functions/modules/identity/user-data/entrypoint.ts
`

- [x] **Step 2: Update imports without changing behavior.**

Entrypoints in `modules/audit`, `modules/analytics`, and `modules/content` use `../../_shared/` and `./index.ts`. Entrypoints in the identity submodules use `../../../_shared/` and `../index.ts`. Preserve all exported dispatch and handler names.

- [x] **Step 3: Move and update tests.**

Move tests with `git mv` into their owning module directories. Update shared imports, moved entrypoint imports, and migration URLs. Tests in top-level modules use `../../../migrations/`; identity submodule tests use `../../../../migrations/`.

- [x] **Step 4: Run focused tests.**

`powershell
deno test -A supabase/functions/modules/audit
deno test -A supabase/functions/modules/analytics
deno test -A supabase/functions/modules/content
deno test -A supabase/functions/modules/identity
`

Expected: all moved tests pass.

### Task 3: Move YouTube into its own module

**Files:**
- Move `youtube-livestream/index.ts` → `modules/youtube-livestream/entrypoint.ts`.
- Move `cache.ts`, `schedule.ts`, `types.ts`, `youtube.ts`, and all YouTube tests into `modules/youtube-livestream/`.

- [x] **Step 1: Move implementation and tests.**

`powershell
New-Item -ItemType Directory -Path supabase/functions/modules/youtube-livestream -Force | Out-Null
git mv supabase/functions/youtube-livestream/*.ts supabase/functions/modules/youtube-livestream/
`

- [x] **Step 2: Fix imports.**

Keep YouTube implementation imports module-local. Update the entrypoint shared imports to `../../_shared/`. Preserve `createLivestreamHandler`, `handleLivestreamRequest`, all repository types, environment names, and response behavior.

- [x] **Step 3: Run focused YouTube tests.**

`powershell
deno test -A supabase/functions/modules/youtube-livestream
`

Expected: cache, schedule, provider, migration, and handler tests pass.

### Task 4: Configure custom entrypoints and remove public directories

**Files:**
- Modify: `supabase/config.toml`.
- Modify: `supabase/functions/tests/architecture/edge-module-boundaries.test.ts`.
- Delete the six now-empty public function directories.

- [x] **Step 1: Add exact config mappings.**

`toml
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
`

- [x] **Step 2: Confirm no public function directories remain.**

Run:

`powershell
Get-ChildItem supabase/functions -Directory |
  Where-Object { $_.Name -in @("activity-logs","analytics-data","content-data","create-user","user-data","youtube-livestream") }
`

Expected: no output and no `.gitkeep` files.

- [x] **Step 3: Run the architecture contract green.**

`powershell
deno test -A supabase/functions/tests/architecture/edge-module-boundaries.test.ts
`

Expected: PASS for config mappings, module entrypoints, no public directories, no legacy files, and module boundaries.

### Task 5: Update documentation and verify deployment

**Files:**
- Modify current README, architecture, API, component, development, security, migration, frontend-data-access, audit, and implementation-plan references.
- Modify `icarecenter-frontend/package.json` only if relocated test paths require it.

- [x] **Step 1: Document public names versus private module entrypoints.**

Replace references to `functions/<name>/index.ts` as deployment adapters with the `config.toml` mapping and module-owned entrypoint paths.

- [ ] **Step 2: Search stale paths.**

`powershell
rg -n --hidden --glob "!.git/**" --glob "!icarecenter-frontend/node_modules/**" "supabase/functions/(activity-logs|analytics-data|content-data|create-user|user-data|youtube-livestream)/|icarecenter-supabase" README.md documentations supabase
`

Expected: no stale deployment-directory references or placeholders.

- [x] **Step 3: Deploy and inspect the remote function list from the repository root.**

`powershell
npx supabase@latest functions deploy --project-ref neddwzfwqcjsdjinoato --jobs 1
npx supabase@latest functions list --project-ref neddwzfwqcjsdjinoato
`

Expected: all six local functions deploy successfully and retain their public names.

- [x] **Step 4: Run relevant local gates.**

`powershell
deno test -A supabase/functions
cd icarecenter-frontend
npm run typecheck
npm exec -- ultracite doctor
npm exec -- ultracite check
npm run test:ssr
npm run test:architecture -- --config trashAssetsBeforeRuns=false
$env:VITE_SUPABASE_URL = "https://ci.invalid"; $env:VITE_SUPABASE_PUBLISHABLE_KEY = "ci-placeholder-key"; npm run build:ssr
npm audit --audit-level=low --omit=optional
`

Expected: every executable command passes; if Deno is unavailable locally, report that exact limitation.

- [ ] **Step 5: Commit.**

`powershell
git add -A
git diff --cached --check
git commit -m "refactor: make edge entrypoints module-owned"
`

## Self-review

Every design requirement is covered: all six functions are mapped, the five existing modular adapters move into their modules, YouTube becomes a module, tests move with code, public directories are removed, documentation is updated, and CLI deployment is verified.
