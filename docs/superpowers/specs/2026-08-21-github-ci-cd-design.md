# GitHub CI/CD design

## Goal

Make `master` the single production release path: GitHub Actions validates every pull request and `master` push, then automatically deploys the verified application to the existing Netlify site and the linked Supabase project.

## Pipeline

`.github/workflows/ci-cd.yml` runs on pull requests, pushes to `master`, and manual runs. The `validate` job installs the repository's Node and Deno toolchains, runs TypeScript checks, Edge Function tests, architecture tests, the focused livestream Cypress suite, and the SSR production build. It uploads the resulting `dist` artifact.

On a successful `master` run, `deploy-netlify` downloads that exact artifact and uses the pinned local Netlify CLI to deploy `dist/client`, `dist/server`, and `netlify/functions` to the existing production site. `deploy-supabase` links the configured project, applies pending migrations, updates the two YouTube Edge Function secrets, and deploys `youtube-livestream` with JWT verification disabled for its public endpoint.

Netlify's current Git-triggered production build must be disabled to prevent an ungated duplicate deploy. Netlify remains the production host; GitHub Actions becomes the release trigger.

## Security

Public Supabase browser values are GitHub repository variables. Netlify credentials, Supabase access/database credentials, and YouTube secrets are GitHub `production` environment secrets. No secret is committed or exposed as a `VITE_*` variable.

The deployment jobs use a single non-canceling production concurrency group so two `master` releases cannot deploy concurrently.

## Verification

The workflow locks the Netlify CLI in `package-lock.json`, and local typecheck, Edge tests, architecture tests, focused Cypress tests, and SSR build are run before committing. The existing Ultracite/Biome configuration mismatch is documented separately and is not silently treated as a passing quality gate.
