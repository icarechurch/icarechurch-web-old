# Security and CI Hardening Design

**Date:** 2026-09-26

## Goal

Remediate the repository's observed CI failures and non-transport, non-database security risks while preserving the current frontend, SSR, Netlify, Supabase Edge Function, and Cypress behavior.

## Scope

In scope:

- GitHub Actions reliability, bounded execution, dependency auditing, and deterministic toolchain configuration.
- Biome/Ultracite configuration compatibility.
- Vulnerable frontend dependency updates and lockfile consistency.
- SSR response headers and safe error handling.
- Netlify security headers and deployment configuration that does not change application routing.
- External new-tab link hardening and non-sensitive UI cookie attributes.
- Regression tests and documentation for the changes.

Explicitly out of scope:

- Frontend-backend transport redesign or transport vulnerability remediation.
- Database schema, migrations, RLS, storage policy, or database vulnerability remediation.
- Broad CSP rollout, CodeQL/SAST platform adoption, or unrelated refactoring that could change runtime behavior.

## Observed Baseline

- TypeScript typechecking passes.
- The architecture Cypress test passes.
- Edge tests cannot run on the current workstation because Deno is not installed; CI already provisions Deno.
- `npm exec -- ultracite check` fails because the Biome 2 configuration uses the removed `files.ignore` property.
- The SSR build reaches its verification script but requires the CI-provided Supabase placeholder environment locally.
- `npm audit` reports vulnerable `qs`, React Router, and Vite's esbuild dependency ranges; the resolver reports non-breaking lockfile updates for them.

## Design

### CI and dependency controls

The workflow will continue to run typecheck, Deno tests, architecture tests, a browser smoke test, and the SSR build as blocking steps. It will additionally run the repository's configured lint/format check and a production dependency audit. The job will have a finite timeout, use the declared Node 22/npm 10 toolchain, and pass explicit placeholder variables to SSR verification. Existing checks will not be made advisory or skipped.

The Biome configuration will use supported include/force-ignore patterns so Ultracite scans the intended frontend sources without traversing tests, generated output, or dependency directories. Dependency changes will be applied through the lockfile-aware package manager and verified with a clean install, audit, typecheck, build, and existing tests.

### Runtime hardening

SSR responses will set safe baseline headers: content-type sniffing prevention, clickjacking protection, strict referrer behavior, restrictive permissions policy, and HSTS in production HTTPS deployments. The same compatible headers will be declared for Netlify so static and function responses receive consistent protection.

SSR failures will return the existing generic response without persisting full stack traces into the application working directory. Server logs will retain a timestamp and sanitized error summary for diagnosis while avoiding request contents and stack exposure to clients. Startup will validate the configured port and use the existing deployment port behavior.

External links opened in a new tab will include `noopener noreferrer`. The sidebar preference cookie will use an explicit SameSite policy and production-only Secure attribute; its non-sensitive behavior remains unchanged.

### Verification boundaries

Tests will exercise the SSR app directly for security headers and generic error responses. Existing route, SEO, architecture, browser, and Edge Function tests remain unchanged except for CI setup needed to run them reliably. No database or frontend-backend transport code will be edited.

## Acceptance Criteria

- Ultracite completes without configuration errors.
- The dependency audit has no known vulnerabilities in the selected audit scope, or any remaining advisory is documented as outside the approved scope with evidence.
- CI has bounded execution and preserves all existing blocking lanes.
- A clean lockfile install, typecheck, lint/format check, Edge Function tests, architecture test, browser smoke test, and SSR build pass with the declared toolchain.
- SSR and Netlify security headers are present without breaking existing routes or external integrations.
- SSR failures expose only a generic response and do not create a stack-trace log file in the application directory.
- New-tab links retain their destinations and include the required opener protections.
- No database migrations, RLS policies, storage policies, or transport interfaces are changed.
