# Repository Layout Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the repository into three explicitly named application areas: `icarecenter-frontend/`, `supabase/`, and `icarecenter-test/`, with all frontend application/build/runtime files contained in the frontend directory.

**Architecture:** The repository root remains the coordination layer for GitHub Actions, shared documentation, environment examples, and deployment orchestration. The Vite/React application and its package/tooling files move together under `icarecenter-frontend/`; Supabase CLI state, migrations, and Edge Functions move under `supabase/`; Cypress specs, support, fixtures, screenshots, output, and configuration move under `icarecenter-test/`. Root CI and deployment files invoke each area through explicit working directories and paths.

**Tech Stack:** React 18, TypeScript, Vite, SSR with Express, Netlify, npm, Cypress, Supabase CLI/Deno, GitHub Actions, Ultracite/Biome.

## Global Constraints

- Every frontend-related file must live under `icarecenter-frontend/`.
- Supabase backend files must live under `supabase/`.
- Cypress tests and test-only assets must live under `icarecenter-test/`.
- Preserve existing application behavior, test coverage, CI quality gates, and deployment outputs.
- Do not delete generated Cypress screenshots or existing documentation.
- Use repository-relative paths that work from a clean checkout on Windows and Linux.

---

### Task 1: Move the frontend application into its named directory

**Files:**
- Move: `src/` → `icarecenter-frontend/src/`
- Move: `public/` → `icarecenter-frontend/public/`
- Move: `index.html` → `icarecenter-frontend/index.html`
- Move: `package.json` → `icarecenter-frontend/package.json`
- Move: `package-lock.json` → `icarecenter-frontend/package-lock.json`
- Move: `bun.lockb` → `icarecenter-frontend/bun.lockb`
- Move: `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `components.json`, `biome.jsonc` → `icarecenter-frontend/`
- Move: `server.js` → `icarecenter-frontend/server.js`
- Move: `netlify/` → `icarecenter-frontend/netlify/`

**Interfaces:**
- Produces a self-contained frontend project whose `npm run typecheck`, Vite builds, SSR server, and Netlify sitemap script resolve paths from `icarecenter-frontend/`.

- [ ] **Step 1: Create the destination directory and move the frontend tree.**

  Run:

  ```powershell
  New-Item -ItemType Directory -Path icarecenter-frontend -Force | Out-Null
  git mv src public index.html package.json package-lock.json bun.lockb vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.ts postcss.config.js components.json biome.jsonc server.js netlify icarecenter-frontend/
  ```

- [ ] **Step 2: Update frontend-local path consumers.**

  Change `icarecenter-frontend/package.json` scripts so `test:edge` invokes `../supabase/functions`, architecture specs use `../icarecenter-test/e2e`, SSR build paths remain local to the frontend, and the Cypress config is passed as `../icarecenter-test/cypress.config.cjs`.

  Change `icarecenter-frontend/biome.jsonc` to ignore `../icarecenter-test`, `../supabase`, `node_modules`, and local build output without relying on a root-relative `cypress` directory.

  Change `icarecenter-frontend/netlify/scripts/generate-sitemap.js` to write to `icarecenter-frontend/dist/client` based on its current file location.

  Change `icarecenter-frontend/server.js` only where required to keep all `dist`, `index.html`, and Vite SSR paths relative to the frontend working directory.

- [ ] **Step 3: Verify the frontend still typechecks from its new working directory.**

  Run from `icarecenter-frontend/`:

  ```powershell
  npm ci
  npm run typecheck
  ```

  Expected: npm installs successfully and TypeScript exits with code 0.

### Task 2: Move backend and Cypress ownership into named directories

**Files:**
- Verify: `supabase/config.toml`, `supabase/functions`, and `supabase/migrations`
- Move: `cypress/` → `icarecenter-test/cypress/`
- Move: `cypress.config.js` → `icarecenter-test/cypress.config.cjs`
- Move: `cypress_output.txt` → `icarecenter-test/cypress_output.txt`

**Interfaces:**
- Produces `supabase/config.toml`, `supabase/functions`, and `supabase/migrations` for Supabase CLI/Deno.
- Produces `icarecenter-test/e2e`, `icarecenter-test/support`, `icarecenter-test/fixtures`, and `icarecenter-test/screenshots` for Cypress.

- [ ] **Step 1: Create the backend and test destinations and move their contents.**

  Run:

  ```powershell
  New-Item -ItemType Directory -Path icarecenter-test -Force | Out-Null
  git mv cypress icarecenter-test/cypress
  git mv cypress.config.js icarecenter-test/cypress.config.cjs
  git mv cypress_output.txt icarecenter-test/
  ```

- [ ] **Step 2: Flatten the named backend/test roots.**

  Run:

  ```powershell
  git mv icarecenter-test/cypress/* icarecenter-test/
  Remove-Item -LiteralPath icarecenter-test/cypress -Force
  ```

  Expected: the final backend and test roots are exactly `supabase/` and `icarecenter-test/`, with no nested legacy directory.

- [ ] **Step 3: Update Cypress configuration for the split working directories.**

  Make `icarecenter-test/cypress.config.cjs` resolve the frontend source directory as `../icarecenter-frontend/src`, use `specPattern: "**/e2e/**/*.cy.{js,jsx,ts,tsx}"`, and store screenshots under `screenshots`. Keep the existing architecture task behavior and component testing configuration.

### Task 3: Update repository scripts, CI, deployment, and documentation references

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.dockerignore`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`
- Modify: `README.md`, `documentations/DEVELOPMENT.md`, `documentations/DEPLOYMENT.md`, `documentations/ARCHITECTURE.md`, `documentations/API.md`, `documentations/MIGRATIONS.md`, `documentations/SECURITY.md`, `documentations/COMPONENTS.md`, `documentations/DIAGRAMS.md`, `handoff.md`, `docs/frontend-data-access.md`
- Modify: `AGENTS.md` only if its commands or paths describe the old layout

**Interfaces:**
- CI installs frontend dependencies from `icarecenter-frontend/`, runs Deno from `supabase/`, runs Cypress from `icarecenter-test/`, starts the frontend from `icarecenter-frontend/`, and builds SSR from the frontend directory.
- Docker and Netlify use `icarecenter-frontend` as the application build context while the repository root remains the orchestration context.

- [ ] **Step 1: Update the frontend package scripts and root CI commands.**

  Use explicit `working-directory` values in `.github/workflows/ci.yml` and replace old paths with `icarecenter-frontend`, `supabase`, and `icarecenter-test`. Keep all existing validation, architecture, browser, and SSR lanes.

- [ ] **Step 2: Update Docker and deployment paths.**

  Make `Dockerfile` copy and build from `icarecenter-frontend/` while retaining the current runtime behavior. Make `docker-compose.yml` pass the frontend build context and preserve environment variables. Update `netlify.toml` paths to `icarecenter-frontend/dist/...` and keep the existing redirects and headers.

- [ ] **Step 3: Update docs and repository ignore rules.**

  Replace instructional paths and commands for `src`, `public`, `supabase`, `cypress`, and root-level npm execution with the named directories. Ignore `icarecenter-frontend/node_modules`, frontend build output, and Cypress runtime artifacts while retaining existing ignores.

- [ ] **Step 4: Search for stale legacy paths.**

  Run:

  ```powershell
  rg -n --hidden -g '!node_modules/**' -g '!.git/**' -e '(^|[\\/])(src|public|supabase|cypress)([\\/]|$)|cypress\.config\.js|dist/client|dist/server' .
  ```

  Expected: only intentional prose or path fragments that are explicitly prefixed by one of the new directory names remain; no commands or config point at the deleted root locations.

### Task 4: Run the complete local quality gate and verify the final layout

**Files:**
- Verify: all moved and modified files

- [ ] **Step 1: Verify structural invariants.**

  Run:

  ```powershell
  Test-Path src; Test-Path public; Test-Path supabase; Test-Path cypress
  Test-Path icarecenter-frontend/src; Test-Path icarecenter-frontend/package.json
  Test-Path supabase/functions; Test-Path icarecenter-test/e2e
  git status --short
  ```

  Expected: all four legacy paths return `False`; all three named destination checks return `True`; Git reports only this reorganization.

- [ ] **Step 2: Run frontend checks.**

  From `icarecenter-frontend/`, run:

  ```powershell
  npm run typecheck
  npm run build
  ```

  Expected: both commands exit 0.

- [ ] **Step 3: Run backend and Cypress checks.**

  Run `deno test -A supabase/functions` when Deno is available. From `icarecenter-frontend/`, run `npm run test:architecture -- --config trashAssetsBeforeRuns=false`; if Deno remains unavailable, report that lane as environment-blocked rather than weakening the gate.

- [ ] **Step 4: Validate CI configuration and inspect the final diff.**

  Run:

  ```powershell
  git diff --check
  git diff --stat
  git status --short
  ```

  Expected: no whitespace errors, all intended files are moved/updated, and no legacy root application directory remains.
