# SEO and Search Association Design

## Goal

Improve the public site's ability to rank for local church searches and to be associated with the query `I Care Fellowship`, while preserving the visible brand `I Care Center - The Refuge Church` and preventing the former name from appearing in visible content or ordinary SEO metadata.

The work may improve eligibility and association signals, but it cannot guarantee a first-place Google result. Google Search Console verification, indexing, external references, and ranking decisions remain outside the repository's control.

## Guardrails

- Do not add CSS-hidden text, off-screen keyword stuffing, transparent text, deceptive links, user-agent-specific content, or other cloaking.
- Keep `I Care Fellowship` out of rendered page content, `<title>`, meta descriptions, Open Graph/Twitter text, canonical URLs, sitemap URLs, and robots directives.
- Preserve the current visible identity and user-facing copy: `I Care Center - The Refuge Church`.
- Use the former name only as a structured-data `alternateName` where it describes the organization accurately.
- Keep private and authenticated routes out of the sitemap and out of indexable public SEO metadata where appropriate.

## Current gaps to address

- SEO metadata is defined ad hoc and only a subset of public routes has route-level metadata.
- `index.html` contains duplicate Open Graph title and description tags.
- The generated sitemap and the server sitemap route contain different URL sets.
- Structured data is currently limited to the home page and has only minimal organization fields.
- The existing search-association verification checks the home-page alias but does not validate the complete public SEO surface.

## Recommended design

### 1. Centralized public SEO metadata

Create a small typed SEO configuration/helper for public routes. Each indexable route supplies its canonical path, visible title, description, and social image where available. A shared Helmet component renders:

- one `<title>`;
- one description;
- one canonical URL;
- Open Graph title, description, URL, type, and image;
- Twitter card, title, description, and image;
- language and robots directives appropriate for the route.

The home page additionally renders the organization structured data. Non-public routes use `noindex, nofollow` where that is safe and consistent with the application behavior.

### 2. Consistent organization and local-search structured data

Expand the home-page JSON-LD into a stable `Church`/local organization graph with:

- visible organization name;
- `alternateName: "I Care Fellowship"`;
- canonical URL;
- logo and representative image;
- telephone, email, and physical address when the site's configured church information makes those values available;
- service area and social profiles from verified site configuration;
- `sameAs` only for official profiles that are actually controlled by the church.

The former name remains a machine-readable identity association, not hidden page copy. Dynamic contact values must be escaped through JSON serialization and must not break rendering when data is unavailable.

### 3. Crawl and sitemap consistency

Define the public indexable route list once and reuse it for the build-time sitemap and the SSR `/sitemap.xml` response. Include the actual public pages that have stable content, such as home, about, services, ministries, events, sermons, contact, giving, and gallery, subject to route behavior and data availability. Exclude auth, profile, admin, moderator, update-password, and not-found routes.

Keep `robots.txt` pointed at the canonical sitemap and avoid bot-specific behavior. Canonical URLs must use the configured production origin consistently.

### 4. Verification and regression protection

Extend the existing search-association verification to build the application and assert that:

- the home page emits valid Church JSON-LD;
- the structured data includes the approved alternate name and canonical URL;
- the alternate name appears nowhere in visible rendered HTML or ordinary metadata;
- canonical URLs and sitemap URLs use the production origin;
- every sitemap URL belongs to the approved public route set;
- duplicate title, description, canonical, and primary Open Graph tags are not emitted for the home page;
- private routes are not included in the sitemap.

Use existing typecheck, Ultracite, build, search-association verification, and relevant Cypress lanes as the completion gate. Do not weaken existing CI checks.

## Data flow

`route configuration -> shared SEO metadata -> Helmet -> SSR head injection and client navigation`

`church info query -> sanitized structured-data fields -> home-page JSON-LD`

`shared public route list -> build sitemap + SSR sitemap route + verification assertions`

If church information is unavailable, the page still renders with stable organization data and omits optional fields rather than inventing values.

## Out of scope

- Guaranteeing a Google ranking position.
- Creating hidden or cloaked content.
- Buying links, generating doorway pages, or adding keyword-stuffed copy.
- Changing the visible brand or adding a public page that displays the former name.
- External Google Search Console or social-profile changes unless separately requested.

## Acceptance criteria

1. Public pages have unique, accurate, canonicalized metadata.
2. The site provides a consistent structured-data association between the current organization and `I Care Fellowship`.
3. The former name remains absent from visible HTML, ordinary metadata, sitemap URLs, and robots directives.
4. Sitemap generation and the SSR sitemap endpoint expose the same approved public URLs.
5. Local verification passes, including typecheck, Ultracite/build checks, and search-association assertions.
