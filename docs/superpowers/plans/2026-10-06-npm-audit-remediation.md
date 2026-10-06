# npm Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the frontend CI audit gate pass while preserving the current application styling and all existing CI quality checks.

**Architecture:** Upgrade the frontend from Tailwind CSS 3’s PostCSS integration to the supported Tailwind CSS 4 Vite integration. Load the existing JavaScript/TypeScript theme configuration explicitly, replace the Tailwind 3 animation plugin with the CSS-only `tw-animate-css` package, and update the lockfile so no vulnerable Tailwind 3 dependency chain remains.

**Tech Stack:** npm lockfile v3, Vite 7, React, Tailwind CSS 4.3.3, `@tailwindcss/vite` 4.3.3, `tw-animate-css` 1.4.0, TypeScript, Ultracite, Cypress, Deno.

## Global Constraints

- Keep `npm audit --audit-level=low --omit=optional` as a required CI gate.
- Do not omit development dependencies, add advisory ignores, weaken tests, or add focused/skipped tests.
- Preserve the existing `.gitignore` change and do not stage it in task commits.
- Keep all work and commits on the shared `development` branch.
- Use `npm ci` to prove the committed lockfile is reproducible.

---

### Task 1: Establish the failing security baseline

**Files:**
- Read: `icarecenter-frontend/package.json`
- Read: `icarecenter-frontend/package-lock.json`
- Read: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the repository’s current dependency manifest and CI audit command.
- Produces: a recorded local baseline of the vulnerable package graph and the existing validation commands.

- [ ] **Step 1: Reproduce the CI audit command**

  Run from `icarecenter-frontend`:

  ```powershell
  npm.cmd audit --audit-level=low --omit=optional
  ```

  Expected: failure matching the supplied report, including `compression`, `proxy-addr`, `source-map-js`, `brace-expansion`, `braces`, and `postcss-selector-parser` paths.

- [ ] **Step 2: Record the dependency paths**

  ```powershell
  npm.cmd ls brace-expansion braces compression postcss-selector-parser proxy-addr source-map-js chokidar micromatch fast-glob tailwindcss postcss-nested --all
  ```

  Expected: Tailwind CSS 3 owns the `chokidar`/`fast-glob`/`micromatch`/`braces` and `postcss-selector-parser@6.x` paths.

### Task 2: Upgrade the dependency graph

**Files:**
- Modify: `icarecenter-frontend/package.json`
- Modify: `icarecenter-frontend/package-lock.json`

**Interfaces:**
- Consumes: the baseline package graph from Task 1.
- Produces: a reproducible graph using Tailwind CSS 4 and patched security versions.

- [ ] **Step 1: Install the supported Tailwind 4 build packages and patched packages**

  Run from `icarecenter-frontend`:

  ```powershell
  npm.cmd install --save-dev tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 tw-animate-css@1.4.0
  npm.cmd uninstall --save-dev tailwindcss-animate
  npm.cmd install compression@1.8.2
  ```

  Expected: only the frontend manifest and lockfile are changed, and the lockfile no longer contains Tailwind CSS 3’s vulnerable dependency chain. The patched transitive versions are selected during the lockfile refresh because their current parent ranges already include the fixed releases.

- [ ] **Step 2: Inspect the resulting graph before code changes**

  ```powershell
  npm.cmd ls tailwindcss @tailwindcss/vite tw-animate-css tailwindcss-animate brace-expansion braces compression proxy-addr source-map-js postcss-selector-parser --all
  ```

  Expected: Tailwind CSS 4 and `@tailwindcss/vite` are installed; `tailwindcss-animate` is absent; patched direct packages are present.

- [ ] **Step 3: Refresh compatible transitive security fixes without force-upgrading**

  Run from `icarecenter-frontend`:

  ```powershell
  npm.cmd audit fix --package-lock-only
  ```

  Expected: the lockfile selects `proxy-addr@2.0.8`, `source-map-js@1.2.2`, and `brace-expansion@5.0.12` without adding those transitive packages as new top-level dependencies or using `--force`.

### Task 3: Move the build integration to Tailwind CSS 4

**Files:**
- Modify: `icarecenter-frontend/vite.config.ts`
- Modify: `icarecenter-frontend/postcss.config.js`
- Modify: `icarecenter-frontend/tailwind.config.ts`
- Modify: `icarecenter-frontend/src/index.css`

**Interfaces:**
- Consumes: Tailwind CSS 4 packages from Task 2.
- Produces: Vite CSS processing through the official Tailwind Vite plugin, with the existing theme and animation utility names available to application components.

- [ ] **Step 1: Register the official Vite plugin**

  Add the named import and plugin entry to `vite.config.ts`:

  ```ts
  import tailwindcss from "@tailwindcss/vite";
  ```

  ```ts
  plugins: [react(), tailwindcss()],
  ```

- [ ] **Step 2: Remove the obsolete PostCSS Tailwind plugin**

  Change `postcss.config.js` to retain only the still-used PostCSS plugins:

  ```js
  export default {
    plugins: {
      autoprefixer: {},
    },
  };
  ```

- [ ] **Step 3: Remove the Tailwind 3 JavaScript animation plugin registration**

  Remove `plugins: [require("tailwindcss-animate")]` from `tailwind.config.ts` and leave the theme configuration available for explicit loading.

- [ ] **Step 4: Update the stylesheet entry directives**

  At the beginning of `src/index.css`, replace the three Tailwind 3 directives with:

  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @config "../tailwind.config.ts";
  ```

  Keep the Google font imports and all project-specific CSS below these directives. Remove duplicate v3-only base directives only if the Tailwind 4 build reports them as unsupported; preserve the project’s custom base rules and animations.

### Task 4: Validate the dependency remediation and styling build

**Files:**
- Read: `icarecenter-frontend/package.json`
- Read: `icarecenter-frontend/package-lock.json`
- Read: `icarecenter-frontend/dist/`

**Interfaces:**
- Consumes: the migrated build and lockfile from Tasks 2–3.
- Produces: evidence that clean installation, audit, typechecking, linting, SSR build, and existing test lanes pass.

- [ ] **Step 1: Reinstall from the lockfile**

  ```powershell
  npm.cmd ci
  ```

  Expected: exit code 0 and a clean install from `package-lock.json`.

- [ ] **Step 2: Run the audit gate**

  ```powershell
  npm.cmd audit --audit-level=low --omit=optional
  ```

  Expected: exit code 0 with no vulnerabilities reported at or above low severity.

- [ ] **Step 3: Run the fast CI checks**

  ```powershell
  npm.cmd run typecheck
  npm.cmd exec -- ultracite doctor
  npm.cmd exec -- ultracite check
  npm.cmd run test:ssr
  npm.cmd run test:edge
  ```

  Expected: every command exits 0 without suppressed failures.

- [ ] **Step 4: Run the architecture test and production SSR build**

  ```powershell
  npm.cmd run test:architecture -- --config trashAssetsBeforeRuns=false
  npm.cmd run build:ssr
  ```

  Expected: both commands exit 0 and the generated client/server bundles are produced.

- [ ] **Step 5: Run the focused browser test matching CI**

  Start Vite in a separate PowerShell process and then run:

  ```powershell
  npm.cmd exec -- cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts
  ```

  Expected: the focused Cypress suite passes against the local Vite server.

- [ ] **Step 6: Inspect the final diff and status**

  ```powershell
  git diff --check
  git status --short
  git diff --stat
  ```

  Expected: only the approved design/plan documents, frontend dependency/configuration files, and lockfile are part of this task; the pre-existing `.gitignore` edit remains unstaged.

### Task 5: Commit the implementation

**Files:**
- Commit: `icarecenter-frontend/package.json`
- Commit: `icarecenter-frontend/package-lock.json`
- Commit: `icarecenter-frontend/vite.config.ts`
- Commit: `icarecenter-frontend/postcss.config.js`
- Commit: `icarecenter-frontend/tailwind.config.ts`
- Commit: `icarecenter-frontend/src/index.css`
- Commit: `docs/superpowers/plans/2026-10-06-npm-audit-remediation.md`

**Interfaces:**
- Consumes: the verified implementation from Task 4.
- Produces: one coherent commit on `development` that can be reviewed or pushed without including unrelated user edits.

- [ ] **Step 1: Stage only task files**

  ```powershell
  git add -- docs/superpowers/plans/2026-10-06-npm-audit-remediation.md icarecenter-frontend/package.json icarecenter-frontend/package-lock.json icarecenter-frontend/vite.config.ts icarecenter-frontend/postcss.config.js icarecenter-frontend/tailwind.config.ts icarecenter-frontend/src/index.css
  ```

- [ ] **Step 2: Commit the verified implementation**

  ```powershell
  git commit -m "fix: remediate frontend npm audit vulnerabilities"
  ```

- [ ] **Step 3: Confirm the commit excludes the pre-existing edit**

  ```powershell
  git status --short --branch
  git show --stat --oneline HEAD
  ```

  Expected: `.gitignore` remains modified but unstaged, and the implementation commit contains only the files listed above.
