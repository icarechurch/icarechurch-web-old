# CI/CD Operations

Production releases use GitHub Actions and the `master` branch.

## Pipeline behavior

Every pull request and `master` push runs:

1. Node 22 and Deno setup
2. `npm ci`
3. TypeScript checking
4. Supabase Edge Function tests
5. Frontend architecture tests
6. YouTube livestream Cypress tests
7. Netlify SSR build

After validation succeeds for `master`, GitHub Actions automatically:

- Deploys the verified `dist/client` artifact and Netlify SSR function to the existing production Netlify site.
- Applies pending Supabase migrations.
- Updates `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` in Supabase Edge Function secrets.
- Deploys the public `youtube-livestream` Edge Function.

Two production deploys cannot run concurrently. A newer CI run cancels an older validation run, while an active production deploy is allowed to finish.

## Required GitHub configuration

Create repository variables under **Settings → Secrets and variables → Actions → Variables**:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_PROJECT_REF
```

Set `SUPABASE_PROJECT_REF` to the project reference in `supabase/config.toml`.
For the current project, that value is `neddwzfwqcjsdjinoato`.

Create a GitHub environment named `production`, without required reviewers because production deployment is intentionally automatic. Add these environment secrets:

```text
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD
YOUTUBE_API_KEY
YOUTUBE_CHANNEL_ID
```

The YouTube API key and channel ID must be added only as GitHub/Supabase secrets. Never add them to `.env`, `.env.example`, Git, or a `VITE_*` variable.

`NETLIFY_SITE_ID` is labeled **Project ID** in the current Netlify UI. `NETLIFY_AUTH_TOKEN` is a Netlify personal access token suitable for CI.

## Netlify setup

The current Netlify site is the production host. Disable its Git-triggered production deploy/build so it does not deploy concurrently with GitHub Actions. Keep the site’s existing public environment variables configured as a backup, but GitHub Actions uses the repository variables when it builds the verified artifact.

The workflow deploys with the repository’s `netlify.toml` and publishes:

```text
dist/client
dist/server
netlify/functions/ssr.js
```

## First release

After adding the variables and secrets:

1. Push a commit to `master`.
2. Open the **CI/CD** workflow in GitHub Actions.
3. Confirm `Validate` passes.
4. Confirm **Deploy Netlify** succeeds and the production deploy appears in Netlify.
5. Confirm **Deploy Supabase** succeeds and the function logs show the deployed `youtube-livestream` function.
6. Open the production `/sermons#livestream` page and verify its offline state outside the Sunday checking window.

The workflow is the only place that runs the production Supabase commands described in `handoff.md`.

## Troubleshooting

- A missing GitHub variable can produce a build with missing browser configuration; verify the two `VITE_*` variables first.
- A missing production secret fails in the configuration validation step before any Supabase command runs.
- If Netlify deploys before GitHub Actions, its Git production deploy is still enabled.
- Supabase migration failures should be investigated before rerunning a later `master` deployment; do not repair migration history casually.
