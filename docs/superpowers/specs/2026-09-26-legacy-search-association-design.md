# Legacy Search Association Design

## Goal

Improve the current website's ability to be associated with searches for the church's former name while preserving the current public brand, canonical site URL, and rendered content.

## Approved constraints

- The former name may appear in non-rendered structured data in the site source.
- The former name must not appear in the site URL, route names, canonical URL, page title, meta description, Open Graph content, Twitter metadata, navigation, or rendered page content.
- The Netlify site remains `https://icarecenter.netlify.app/`.
- The existing Weebly site remains indexed; this change does not add redirects or de-indexing instructions.
- No hidden visible text, CSS-hidden keyword blocks, keyword stuffing, cloaking, or misleading user-facing copy.

## Architecture

The home page already owns route-level SEO through `react-helmet-async`, and the SSR server serializes Helmet title, meta, link, and script output into the document head. Add one JSON-LD `Church` object to the home page Helmet output. Keep the current `name` and `url` authoritative, and use the former name only as the truthful `alternateName` property because it describes the organization's historical identity.

The JSON-LD is a non-rendered document-head signal. It does not create a legacy-name route or change the canonical URL. Existing visible copy and social metadata remain current-brand-only.

## Verification

- TypeScript and Ultracite checks must pass.
- The SSR build must pass and generate the sitemap with only the canonical current-site URL structure.
- A source/output check must confirm the former name occurs only in the intended structured-data field and never in URL or visible SEO fields.
- Existing CI lanes remain unchanged.

## Non-goals

- Guaranteeing a ranking position for a query.
- Replacing or de-indexing the Weebly site.
- Adding an old-name page, URL, redirect, or visible compatibility notice.
- Updating Google Business Profile, social profiles, directories, or backlinks; those are external follow-up work.
