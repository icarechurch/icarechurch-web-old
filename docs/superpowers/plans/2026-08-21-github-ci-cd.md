# GitHub CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every successful `master` validation automatically deploy the verified SSR site to Netlify and the livestream backend to Supabase.

**Architecture:** A single GitHub Actions workflow validates pull requests and `master` pushes, uploads the built SSR artifact, and gates two production deploy jobs on that validation. Netlify receives the prebuilt client/server/function bundle; Supabase receives migrations, secrets, and the public YouTube Edge Function.

**Tech Stack:** GitHub Actions, Node.js 22, Deno, Netlify CLI, Supabase CLI, Cypress, Vite SSR.

## Global Constraints

- Production branch is `master`.
- Production deploys are automatic after CI succeeds.
- Netlify remains the production host, but its independent Git production build must be disabled.
- Supabase remote commands run only inside the post-CI GitHub deployment job.
- `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` remain Supabase Edge Function secrets only.
- Use `--no-verify-jwt` for the public `youtube-livestream` function.
- Do not commit values for any secret or public environment variable.

---

### Task 1: Add the pinned Netlify CLI

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the exact CLI version**

Run:

```powershell
npm install --save-dev netlify-cli@27.1.2
```

Expected: `netlify-cli` is added under `devDependencies` and the lockfile records version `27.1.2`.

- [ ] **Step 2: Verify the executable**

Run:

```powershell
npm exec -- netlify --version
```

Expected: `27.1.2`.

### Task 2: Add the CI/CD workflow

**Files:**
- Create: `.github/workflows/ci-cd.yml`

- [ ] **Step 1: Add validation and deployment jobs**

The workflow must run on `pull_request`, `push` to `master`, and `workflow_dispatch`. The `validate` job runs `npm ci`, `npm run typecheck`, `npm run test:edge`, `npm run test:architecture`, the focused Cypress livestream suite against Vite, and `npm run build:ssr`, then uploads `dist`.

The `deploy-netlify` and `deploy-supabase` jobs must both have `needs: validate`, run only for `master` pushes/manual runs, use the `production` environment, and use `production-deploy` concurrency with `cancel-in-progress: false`.

Netlify must run:

```bash
npm exec -- netlify deploy --prod --dir=dist/client --functions=netlify/functions --site="$NETLIFY_SITE_ID" --message="GitHub Actions $GITHUB_SHA"
```

Supabase must run:

```bash
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push --linked
supabase secrets set --project-ref "$SUPABASE_PROJECT_REF" "YOUTUBE_API_KEY=$YOUTUBE_API_KEY" "YOUTUBE_CHANNEL_ID=$YOUTUBE_CHANNEL_ID"
supabase functions deploy youtube-livestream --project-ref "$SUPABASE_PROJECT_REF" --no-verify-jwt
```

- [ ] **Step 2: Validate workflow syntax**

Run a YAML parser against `.github/workflows/ci-cd.yml` and verify that both deployment jobs depend on `validate` and are restricted to `master`.

### Task 3: Document operator configuration

**Files:**
- Create: `documentations/CI-CD.md`
- Modify: `documentations/DEPLOYMENT.md`

- [ ] **Step 1: Document GitHub variables and secrets**

Repository variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_PROJECT_REF
```

`production` environment secrets:

```text
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD
YOUTUBE_API_KEY
YOUTUBE_CHANNEL_ID
```

Document that Netlify’s production Git auto-deploy must be disabled and the `production` environment must exist without required reviewers for automatic deployment.

- [ ] **Step 2: Correct the deployment guide**

State that the workflow builds with `npm run build:ssr`, publishes `dist/client`, and includes `dist/server` and `netlify/functions/ssr.js`.

### Task 4: Verify and commit

- [ ] **Step 1: Run local verification**

```powershell
npm run typecheck
npm run test:edge
npm run test:architecture
npm run build:ssr
```

Expected: all commands exit 0. The existing Ultracite/Biome configuration mismatch remains a documented tooling issue; the workflow uses the working SSR build script after separate typechecking.

- [ ] **Step 2: Inspect and commit**

```powershell
git diff --check
git status --short
git add .github/workflows/ci-cd.yml package.json package-lock.json documentations/CI-CD.md documentations/DEPLOYMENT.md docs/superpowers/specs/2026-08-21-github-ci-cd-design.md docs/superpowers/plans/2026-08-21-github-ci-cd.md
git commit -m "ci: add master production pipeline"
```
