# npm Audit Remediation Design

## Goal

Make the frontend CI security gate pass without omitting development dependencies, ignoring advisories, weakening assertions, or changing unrelated application behavior.

## Root cause

The frontend lockfile contains four directly reachable fixable versions:

- `compression@1.8.1`
- `proxy-addr@2.0.7`
- `source-map-js@1.2.1`
- `brace-expansion@5.0.9`

It also contains no-fix advisory paths from Tailwind CSS 3: `tailwindcss@3.4.19` pulls `chokidar`, `fast-glob`, `micromatch`, and `braces`; its PostCSS nesting path pulls vulnerable `postcss-selector-parser@6.x`. The CI command audits development dependencies, so these build-time packages block the job even though they are not shipped as runtime application code.

## Chosen approach

Move the Tailwind build integration to Tailwind CSS 4, which removes the vulnerable Tailwind 3 dependency chain, while retaining the existing utility-class behavior through the compatibility configuration and the Tailwind 4 animation package. Update the independently fixable runtime/transitive packages in the same lockfile refresh.

The migration will:

1. Upgrade Tailwind CSS and its Vite integration, replace the Tailwind 3 PostCSS plugin configuration, and remove the obsolete Tailwind 3 animation plugin.
2. Preserve the existing theme tokens, custom animations, `@apply` rules, responsive classes, and Radix animation utility classes.
3. Update `compression`, `proxy-addr`, `source-map-js`, and `brace-expansion` to patched versions through `package.json` and `package-lock.json`.
4. Keep `npm audit --audit-level=low --omit=optional` as a required CI check.

## Files and responsibilities

- `icarecenter-frontend/package.json`: dependency and build-plugin declarations.
- `icarecenter-frontend/package-lock.json`: reproducible dependency graph.
- `icarecenter-frontend/vite.config.ts`: Tailwind 4 Vite plugin registration.
- `icarecenter-frontend/postcss.config.js`: remove the obsolete Tailwind 3 PostCSS plugin while retaining Autoprefixer if the build still uses it.
- `icarecenter-frontend/tailwind.config.ts`: retain compatible theme configuration and remove the Tailwind 3-only animation plugin registration.
- `icarecenter-frontend/src/index.css`: use Tailwind 4 import/plugin/config directives and preserve the project’s custom CSS.
- `docs/superpowers/plans/2026-10-06-npm-audit-remediation.md`: execution checklist and verification commands.

## Error handling and compatibility

No application request or data flow changes are planned. If Tailwind 4 rejects a legacy configuration feature or a utility emitted by the current stylesheet, the implementation will adapt that specific configuration or CSS rule and add no unrelated refactor. Any dependency override that installs outside a package’s declared compatibility range is rejected in favor of a supported upgrade.

## Verification

The implementation is complete only when fresh output shows:

- `npm ci` succeeds from `icarecenter-frontend`.
- `npm audit --audit-level=low --omit=optional` exits 0 with no vulnerabilities at or above the configured level.
- `npm run typecheck`, `npm exec -- ultracite doctor`, and `npm exec -- ultracite check` exit 0.
- `npm run test:ssr`, `npm run test:edge`, and `npm run test:architecture -- --config trashAssetsBeforeRuns=false` exit 0.
- The focused YouTube livestream Cypress test and `npm run build:ssr` exit 0, matching the repository CI workflow.

