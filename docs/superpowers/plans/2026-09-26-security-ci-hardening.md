# Security and CI Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the observed GitHub Actions/Cypress failures and harden non-transport, non-database security surfaces without changing existing application behavior.

**Architecture:** Keep the current Vite/React frontend, Express SSR server, Netlify function wrapper, Cypress project, and Supabase Edge Function test boundary. Add small, independently testable security helpers and configuration changes at the existing boundaries, while leaving database migrations, RLS/storage policies, and frontend-backend transport code untouched.

**Tech Stack:** Node 22/npm 10, Vite 7, Express 5, React Router 7.18.4, Cypress 15, Deno Edge Function tests, Biome/Ultracite, Netlify, Docker Compose.

## Global Constraints

- Preserve all existing blocking CI lanes: typecheck, Edge Function tests, architecture test, YouTube livestream browser test, and SSR build.
- Do not modify database migrations, RLS policies, storage policies, or frontend-backend transport implementations.
- Do not use focused/skipped tests, advisory CI steps, swallowed failures, or weakened assertions.
- Keep runtime behavior and existing public routes unchanged.
- Run the smallest affected check after each task, then the complete relevant local gate before completion.

---

### Task 1: Repair Cypress TypeScript discovery and environment exposure

**Files:**
- Modify: `icarecenter-test/cypress.config.cjs`
- Create: `icarecenter-test/tsconfig.json`
- Test: `icarecenter-test/e2e/sermons/youtube-livestream.cy.ts`

**Interfaces:**
- Cypress discovers the test TypeScript compiler configuration at `icarecenter-test/tsconfig.json`.
- Cypress configuration sets `allowCypressEnv: false` and contains no browser-side `Cypress.env()` calls.

- [x] **Step 1: Write the Cypress project configuration test expectation**

Add the project-local TypeScript configuration with the existing frontend compiler settings and Cypress/node types:

```json
{
  "extends": "../icarecenter-frontend/tsconfig.app.json",
  "compilerOptions": {
    "types": ["cypress", "node"],
    "allowJs": true,
    "noEmit": true,
    "baseUrl": "..",
    "paths": {
      "@/*": ["icarecenter-frontend/src/*"]
    }
  },
  "include": ["e2e/**/*.ts", "e2e/**/*.tsx", "support/**/*.ts", "support/**/*.tsx"]
}
```

Run `npm exec -- tsc --noEmit -p ../icarecenter-test/tsconfig.json` from `icarecenter-frontend/` and confirm it fails only if the new file is absent or its settings are invalid. This is a configuration test; no production behavior is changed.

- [x] **Step 2: Add the minimal Cypress configuration changes**

In `icarecenter-test/cypress.config.cjs`, add the top-level setting and leave the existing spec paths and intercept assertions unchanged:

```js
module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
```

Do not replace the livestream test’s existing security assertions. The repository scan must continue to return no `Cypress.env(`, `Cypress.expose(`, or `cy.env(` usage because this spec does not need test secrets.

- [x] **Step 3: Run the targeted TypeScript and Cypress checks**

Run from `icarecenter-frontend/`:

```powershell
npm exec -- tsc --noEmit -p ../icarecenter-test/tsconfig.json
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts --config trashAssetsBeforeRuns=false
```

Expected: the TypeScript project check exits 0; Cypress preprocesses `youtube-livestream.cy.ts`, prints no `allowCypressEnv` warning, and all tests pass.

---

### Task 2: Restore supported Biome/Ultracite scanning

**Files:**
- Modify: `icarecenter-frontend/biome.jsonc`

**Interfaces:**
- `npm exec -- ultracite check` scans 11 supported configuration/runtime files and preserves the repository's original TS/TSX exclusion while force-ignoring generated, dependency, test, and known static-template trees.

- [x] **Step 1: Replace the obsolete configuration key**

Replace the `files` block with the Biome 2-compatible configuration:

```jsonc
"files": {
  "ignoreUnknown": true,
  "includes": [
    "**",
    "!!../icarecenter-test/**",
    "!!**/node_modules/**",
    "!!**/dist/**",
    "!!**/coverage/**",
    "!!**/build/**",
    "!!**/*.d.ts",
    "!!**/*.{js,jsx,ts,tsx}",
    "!!**/*.css",
    "!!public/**",
    "!!index.html",
    "!!src/admin/users/emails/**"
  ]
}
```

Keep the existing `extends` entries. The explicit source exclusions preserve the project’s current Ultracite scope while using a supported Biome key.

- [x] **Step 2: Verify the formatter/linter configuration**

Run from `icarecenter-frontend/`:

```powershell
npm exec -- ultracite doctor
npm exec -- ultracite check
```

Expected: both commands exit 0 and the previous `unknown key ignore` diagnostic is absent.

---

### Task 3: Update vulnerable dependencies without changing application APIs

**Files:**
- Modify: `icarecenter-frontend/package.json`
- Modify: `icarecenter-frontend/package-lock.json`

**Interfaces:**
- Keep the existing declarative routing API while upgrading `react-router-dom` and `react-router` to 7.18.4; update the SSR-only import to the React Router 7 export.
- Resolve `qs` to 6.16.0 and esbuild to 0.28.1 through explicit lockfile overrides.

- [x] **Step 1: Change only the vulnerable resolver constraint**

Update the existing dependency overrides to pin the vulnerable transitive packages:

```json
"esbuild": "0.28.1",
"qs": "6.16.0",
"vite": {
  "esbuild": "0.28.1"
}
```

to:

```json
"vite": {
  "esbuild": "0.28.1"
}
```

Upgrade `react-router-dom`/`react-router` to 7.18.4 because the audit's remaining 6.x remediation was not available; typecheck, SSR build, and Cypress coverage pass with the existing declarative routing API. Do not upgrade React, Vite, Express, or unrelated packages.

- [x] **Step 2: Resolve the lockfile updates**

Resolve the lockfile with the declared npm 10 CI toolchain, then verify the dependency tree. The resulting lockfile installs without known vulnerabilities.

```powershell
npx npm@10.9.2 install --package-lock-only --ignore-scripts
```

Expected: the lockfile resolves React Router 7.18.4, `qs` 6.16.0, and esbuild 0.28.1 without changing the application’s declarative routing behavior.

- [x] **Step 3: Verify dependency integrity before runtime edits**

Run:

```powershell
Remove-Item -LiteralPath node_modules -Recurse -Force
npm ci
npm ls --depth=0
npm audit --audit-level=high --omit=dev
npm audit --audit-level=low --omit=optional
```

Expected: clean install succeeds; the audit commands report no known vulnerabilities in their selected scopes; `npm ls` has no invalid or missing dependency errors.

---

### Task 4: Add test-first SSR security behavior

**Files:**
- Create: `icarecenter-frontend/server.test.mjs`
- Modify: `icarecenter-frontend/server.js`

**Interfaces:**
- `createServer({ root, isProd, renderPage })` continues to return `{ app, vite }`; `renderPage` is an optional test seam with the same `(url, context) => { html, helmet }` contract as the compiled SSR renderer.
- SSR responses expose generic `Internal Server Error` text and safe security headers; they never write `server_error.log`.

- [x] **Step 1: Write the failing header test**

Create `server.test.mjs` with a Node built-in test that starts the Express app on an ephemeral port, requests `/sitemap.xml`, and asserts:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "./server.js";

test("SSR responses include baseline security headers", async () => {
  const { app, vite } = await createServer({ isProd: false });
  const listener = app.listen(0);
  await new Promise((resolve) => listener.once("listening", resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${listener.address().port}/sitemap.xml`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
  } finally {
    await new Promise((resolve, reject) => listener.close((error) => (error ? reject(error) : resolve())));
    await vite?.close();
  }
});
```

Run `node --test server.test.mjs` from `icarecenter-frontend/` and confirm the new test fails because the headers are not yet installed.

- [x] **Step 2: Write the failing generic-error test**

Add a second test using the optional render seam:

```js
test("SSR failures return a generic response without writing a stack trace file", async () => {
  const { app, vite } = await createServer({
    isProd: false,
    renderPage: () => {
      throw new Error("secret internal detail");
    },
  });
  const listener = app.listen(0);
  await new Promise((resolve) => listener.once("listening", resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${listener.address().port}/not-a-static-route`);
    const body = await response.text();
    assert.equal(response.status, 500);
    assert.equal(body, "Internal Server Error");
    assert.equal(body.includes("secret internal detail"), false);
  } finally {
    await new Promise((resolve, reject) => listener.close((error) => (error ? reject(error) : resolve())));
    await vite?.close();
  }
});
```

Run the test and confirm it fails because `createServer` does not yet accept the test renderer and the current server writes a log file.

- [x] **Step 3: Implement the minimal SSR hardening**

In `server.js`:

- Keep `fs` for reading templates but remove the append-to-working-directory error log.
- Add a security-header middleware immediately after creating the Express app. Apply HSTS only when `isProd` is true.
- Add the optional `renderPage` parameter and call it in place of the dynamic renderer when provided.
- In the catch block, log only a timestamp and error class/name, call `vite.ssrFixStacktrace` only when Vite exists, and return the existing generic response.
- Leave route matching, SEO rendering, asset fallback, and cache behavior unchanged.

- [x] **Step 4: Verify SSR tests and build behavior**

Run:

```powershell
node --test server.test.mjs
$env:VITE_SUPABASE_URL = "https://ci.invalid"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "ci-placeholder-key"
npm run build:ssr
```

Expected: both SSR tests pass; the build reaches and passes search-association verification; no `server_error.log` is created.

---

### Task 5: Harden deployment and browser-facing boundaries

**Files:**
- Modify: `icarecenter-frontend/netlify.toml`
- Modify: `icarecenter-frontend/netlify/functions/ssr.js`
- Modify: `icarecenter-frontend/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `icarecenter-frontend/src/shared/components/ui/sidebar.tsx`
- Modify: `documentations/SECURITY.md`

**Interfaces:**
- Existing Netlify routes, SSR function behavior, Docker port, and external link destinations remain unchanged.
- Static and SSR responses receive the same safe header policy.

- [x] **Step 1: Add Netlify security headers**

Add a `/*` header block in `icarecenter-frontend/netlify.toml` containing:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), geolocation=(), microphone=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

Preserve the existing `/index.html` cache rule and redirects.

- [x] **Step 2: Correct the Netlify server factory call**

Change `netlify/functions/ssr.js` to call:

```js
const server = await createServer({ isProd: true });
```

This matches the actual `createServer` object parameter and keeps production SSR explicit.

- [x] **Step 3: Align the Docker runtime and close the production image gap**

Change both Docker stages to `node:22-alpine`, preserve the non-root `node` user, and copy the runtime SEO module required by `server.js`:

```dockerfile
COPY --from=builder /app/seo ./seo
```

Keep the existing lockfile install commands and port 8081. Add Compose `init: true`, `read_only: true`, `tmpfs: /tmp:rw,noexec,nosuid,size=64m`, and `security_opt: [no-new-privileges:true]` only after the SSR error-log removal has passed, so the container does not need a writable application directory.

- [x] **Step 4: Harden the non-sensitive sidebar cookie and verify external links**

In `sidebar.tsx`, append `SameSite=Lax` and append `Secure` only when `window.location.protocol === "https:"`. Audit all existing new-tab anchors and preserve their current `rel="noopener noreferrer"` protections. Add `noopener,noreferrer` to the contact-page Maps `window.open` call; remove inert console output from the Leaflet placeholder.

- [x] **Step 5: Update the security documentation**

Document the actual headers and SSR error behavior in `documentations/SECURITY.md`, remove the obsolete `X-XSS-Protection` recommendation, and preserve the explicit note that transport and database controls are maintained separately.

- [x] **Step 6: Run affected browser and static checks**

Run from `icarecenter-frontend/`:

```powershell
npm run typecheck
npm exec -- ultracite check
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts --config trashAssetsBeforeRuns=false
```

Expected: typecheck, Ultracite, and all livestream browser tests pass without the Cypress environment warning.

---

### Task 6: Make GitHub Actions deterministic and blocking

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`

**Interfaces:**
- The existing validation job remains a single blocking job with all original lanes.
- Failed steps continue to fail the job; no `continue-on-error` or skipped test behavior is introduced.

- [x] **Step 1: Add bounded job execution and explicit environment**

Add `timeout-minutes: 20` to the validation job and set the existing placeholder Supabase variables at job/environment scope so `build:ssr` and Cypress receive them consistently. Keep `permissions: contents: read`.

- [x] **Step 2: Make the Cypress command use the fixed test project**

Keep the existing command and config path, but remove the now-unneeded `trashAssetsBeforeRuns=false` override from the production CI command so the default cleanup behavior remains deterministic. Keep the explicit livestream spec.

- [x] **Step 3: Add actionable process cleanup and diagnostics**

Keep the Vite start command bounded by the job timeout, use the existing retrying readiness check, and add an `if: failure()` diagnostic step that prints `/tmp/icare-vite.log` without changing the job result. Do not use an unbounded wait or convert startup failure into success.

- [x] **Step 4: Add Dependabot coverage**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /icarecenter-frontend
    schedule:
      interval: weekly
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

- [x] **Step 5: Validate workflow and dependency configuration**

Run:

```powershell
git diff --check
npm exec -- ultracite check
```

Then inspect the workflow diff to confirm each matrix/step argument remains forwarded exactly, all test/build commands are still blocking, and the workflow contains no `continue-on-error`, `skip`, or focused test filter.

---

### Task 7: Run the complete repository gate and review scope

**Files:**
- No new files; verify all files changed by Tasks 1–6.

- [x] **Step 1: Run the full frontend CI-equivalent checks**

From `icarecenter-frontend/`, with the CI placeholder variables set:

```powershell
npm ci
npm run typecheck
npm exec -- ultracite doctor
npm exec -- ultracite check
npm run test:edge
npm run test:architecture -- --config trashAssetsBeforeRuns=false
npm run build:ssr
npm audit --audit-level=low --omit=optional
```

Run the YouTube livestream Cypress command separately if it is not already covered by the preceding test command:

```powershell
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts
```

If Deno is unavailable locally, report that exact limitation; the workflow still provisions Deno for the blocking CI lane.

- [x] **Step 2: Review changed-file scope**

Run:

```powershell
git diff --check
git status --short
git diff --stat
git diff -- supabase
```

Expected: no database files changed; no transport implementation files changed; no generated screenshots or build output are included.

- [x] **Step 3: Record final evidence**

Capture exit codes and concise pass/fail counts for each command. Report any unverified remote GitHub Actions result plainly if the workflow cannot be executed from this environment.
