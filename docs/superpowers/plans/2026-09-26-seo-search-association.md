# SEO and Search Association Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the public site consistent, standards-compliant local SEO and structured-data signals that associate it with “I Care Fellowship” without exposing that former name in visible content or ordinary SEO metadata.

**Architecture:** Store the production site identity and public indexable route list in shared JSON consumed by the React SEO layer, the build-time sitemap generator, the SSR sitemap endpoint, and the verification script. Render one route-aware Helmet head from App, then render home-page Church JSON-LD separately so dynamic church contact data is only queried on the home page.

**Tech Stack:** React 18, React Router 6, react-helmet-async, Vite SSR, Node 22 ESM scripts, TypeScript, Cypress, Ultracite/Biome, Netlify SSR.

## Global Constraints

- Do not add CSS-hidden text, off-screen keyword stuffing, transparent text, deceptive links, user-agent-specific content, or other cloaking.
- Keep “I Care Fellowship” out of rendered page content, title, meta descriptions, Open Graph/Twitter text, canonical URLs, sitemap URLs, and robots directives.
- Preserve the visible identity and user-facing copy: “I Care Center - The Refuge Church”.
- Use the former name only as a structured-data alternateName where it describes the organization accurately.
- Keep private and authenticated routes out of the sitemap and out of indexable public SEO metadata where appropriate.
- Do not weaken existing CI checks or existing tests.

---

## File Map

- Create icarecenter-frontend/src/shared/seo/seo-config.json: canonical production origin, visible brand, and social image path.
- Create icarecenter-frontend/src/shared/seo/public-routes.json: the single source of truth for indexable paths, titles, descriptions, sitemap frequencies, and priorities.
- Create icarecenter-frontend/src/shared/seo/RouteSeo.tsx: route-aware Helmet metadata and noindex fallback.
- Create icarecenter-frontend/src/shared/seo/organization-structured-data.ts: typed JSON-LD builder for the public Church entity.
- Modify icarecenter-frontend/src/app/App.tsx: render RouteSeo inside the router context.
- Modify icarecenter-frontend/src/user/home/pages/HomePage.tsx: replace ad hoc head tags with home-page JSON-LD only.
- Modify icarecenter-frontend/src/user/about/pages/AboutPage.tsx and icarecenter-frontend/src/user/service-times/pages/ServicesPage.tsx: remove duplicate route-local Helmet metadata.
- Modify icarecenter-frontend/index.html: remove duplicate static SEO tags.
- Modify icarecenter-frontend/netlify/scripts/generate-sitemap.js and icarecenter-frontend/server.js: consume the shared SEO route/config files.
- Modify icarecenter-frontend/public/robots.txt: keep one generic crawler rule and the canonical sitemap URL.
- Modify icarecenter-frontend/scripts/verify-search-association.mjs: verify every public route, structured data, metadata uniqueness, and sitemap consistency.
- Modify icarecenter-frontend/tsconfig.app.json: enable JSON imports.

---

### Task 1: Add shared SEO data and failing verification coverage

**Files:**
- Create: icarecenter-frontend/src/shared/seo/seo-config.json
- Create: icarecenter-frontend/src/shared/seo/public-routes.json
- Modify: icarecenter-frontend/tsconfig.app.json
- Modify: icarecenter-frontend/scripts/verify-search-association.mjs

**Interfaces:**
- seo-config.json exposes siteUrl, brandName, and socialImagePath.
- public-routes.json exposes path, title, description, changefreq, and priority.
- The verification script reads both JSON files from the frontend working directory.

- [ ] Step 1: Write the failing verification assertions.

Add these assertions before implementing RouteSeo:

~~~js
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const seoConfig = readJson(path.resolve("src/shared/seo/seo-config.json"));
const publicRoutes = readJson(path.resolve("src/shared/seo/public-routes.json"));
const publicPaths = publicRoutes.map(({ path: routePath }) => routePath);

const countMatches = (value, pattern) => value.match(pattern)?.length ?? 0;
const expectOne = (value, pattern, message) => {
  if (countMatches(value, pattern) !== 1) {
    throw new Error(message);
  }
};

for (const route of publicRoutes) {
  const rendered = render(route.path);
  const head = [
    rendered.helmet.title.toString(),
    rendered.helmet.meta.toString(),
    rendered.helmet.link.toString(),
  ].join("\n");

  expectOne(head, /<title\b/gu, route.path + " must emit one title");
  expectOne(head, /name="description"/gu, route.path + " must emit one description");
  expectOne(head, /rel="canonical"/gu, route.path + " must emit one canonical link");
  expectOne(head, /property="og:title"/gu, route.path + " must emit one Open Graph title");
  expectOne(head, /property="og:description"/gu, route.path + " must emit one Open Graph description");

  if (!head.includes(route.title) || !head.includes(route.description)) {
    throw new Error(route.path + " must use its configured SEO copy");
  }
  if (head.includes(legacyName) || rendered.html.includes(legacyName)) {
    throw new Error(route.path + " leaked the approved alternate name");
  }
}

if (publicPaths.some((routePath) => /^(\/auth|\/profile|\/admin|\/moderator|\/update-password)/u.test(routePath))) {
  throw new Error("Private routes must not be present in the public route list");
}

if (seoConfig.siteUrl !== "https://icarecenter.netlify.app") {
  throw new Error("SEO configuration must use the canonical production origin");
}
~~~

- [ ] Step 2: Run the failing verification.

From icarecenter-frontend:

~~~powershell
npm run build:ssr
~~~

Expected: the build reaches verify:search-association and fails because the shared JSON files do not exist. This is the intentional RED state.

- [ ] Step 3: Add seo-config.json.

~~~json
{
  "siteUrl": "https://icarecenter.netlify.app",
  "brandName": "I Care Center - The Refuge Church",
  "socialImagePath": "/icc logo no bg.png"
}
~~~

Add public-routes.json with exactly these public routes and no private routes:

~~~json
[
  { "path": "/", "title": "I Care Center - The Refuge Church | Olongapo City", "description": "Welcome to I Care Center - The Refuge Church, a Christ-centered church family in Olongapo City where people worship, grow, and serve together.", "changefreq": "weekly", "priority": "1.0" },
  { "path": "/about", "title": "About Our Church | I Care Center - The Refuge Church", "description": "Learn about I Care Center - The Refuge Church in Olongapo City, our mission, our values, and the people who serve our church community.", "changefreq": "monthly", "priority": "0.8" },
  { "path": "/services", "title": "Worship Service Times | I Care Center - The Refuge Church", "description": "Find worship service times, what to expect, accessibility information, and directions for visiting I Care Center in Olongapo City.", "changefreq": "weekly", "priority": "0.9" },
  { "path": "/ministries", "title": "Church Ministries in Olongapo City | I Care Center", "description": "Explore church ministries and outreach opportunities at I Care Center in Olongapo City and find ways to connect, serve, and grow.", "changefreq": "weekly", "priority": "0.8" },
  { "path": "/events", "title": "Church Events in Olongapo City | I Care Center", "description": "See upcoming worship services, fellowship events, and community opportunities at I Care Center in Olongapo City.", "changefreq": "weekly", "priority": "0.8" },
  { "path": "/sermons", "title": "Sermons and Online Worship | I Care Center", "description": "Watch sermons and online worship from I Care Center - The Refuge Church in Olongapo City.", "changefreq": "weekly", "priority": "0.8" },
  { "path": "/contact", "title": "Contact and Visit Us | I Care Center - The Refuge Church", "description": "Contact I Care Center, find our Olongapo City location, and learn how to visit our church community.", "changefreq": "monthly", "priority": "0.8" },
  { "path": "/giving", "title": "Give to I Care Center | The Refuge Church", "description": "Learn how to support the ministry of I Care Center - The Refuge Church through in-person and online giving.", "changefreq": "monthly", "priority": "0.6" },
  { "path": "/gallery", "title": "Church Life and Worship Gallery | I Care Center", "description": "View photos from worship, church life, and community at I Care Center in Olongapo City.", "changefreq": "monthly", "priority": "0.6" }
]
~~~

Add resolveJsonModule: true to tsconfig.app.json.

- [ ] Step 4: Run npm run typecheck.

Expected: JSON imports are accepted. The SEO assertions still fail because RouteSeo does not exist; keep that failure as the next RED checkpoint.

- [ ] Step 5: Commit the shared SEO contract.

~~~powershell
git add -- icarecenter-frontend/src/shared/seo/seo-config.json icarecenter-frontend/src/shared/seo/public-routes.json icarecenter-frontend/tsconfig.app.json icarecenter-frontend/scripts/verify-search-association.mjs
git commit -m "test: define public SEO verification contract"
~~~

---

### Task 2: Implement one route-aware metadata source

**Files:**
- Create: icarecenter-frontend/src/shared/seo/RouteSeo.tsx
- Modify: icarecenter-frontend/src/app/App.tsx
- Modify: icarecenter-frontend/index.html

**Interfaces:**
- RouteSeo consumes the current React Router pathname and the shared JSON files.
- RouteSeo produces exactly one title, description, canonical link, Open Graph set, and Twitter set for configured public paths.
- Unknown and private paths produce noindex, nofollow and a fallback title/description containing only the visible brand.

- [ ] Step 1: Confirm the RED state.

~~~powershell
npm run build:ssr
~~~

Expected: a public route fails because it does not emit the configured title, description, canonical, and Open Graph metadata.

- [ ] Step 2: Create RouteSeo.tsx.

Use this implementation shape:

~~~tsx
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import seoConfig from "./seo-config.json";
import publicRoutes from "./public-routes.json";

const routeMetadata = new Map(publicRoutes.map((route) => [route.path, route]));

export function RouteSeo() {
  const { pathname } = useLocation();
  const route = routeMetadata.get(pathname);
  const title = route?.title ?? "Page not found | " + seoConfig.brandName;
  const description = route?.description ?? "The requested page could not be found.";
  const canonicalUrl = seoConfig.siteUrl + (route?.path ?? pathname);
  const socialImageUrl = seoConfig.siteUrl + seoConfig.socialImagePath.replaceAll(" ", "%20");

  return (
    <Helmet>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonicalUrl} rel="canonical" />
      <meta content={route ? "index, follow" : "noindex, nofollow"} name="robots" />
      <meta content={seoConfig.brandName} property="og:site_name" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      <meta content="website" property="og:type" />
      <meta content={socialImageUrl} property="og:image" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={socialImageUrl} name="twitter:image" />
    </Helmet>
  );
}
~~~

- [ ] Step 3: Mount RouteSeo in App.tsx.

Render RouteSeo immediately before AppRoutes, after the providers and initializer have mounted. This keeps useLocation inside both BrowserRouter and StaticRouter.

- [ ] Step 4: Remove static head duplicates from index.html.

Keep charset, favicon, viewport, app-head, the root element, and the client script. Remove the static title, author, duplicate Open Graph tags, and static Twitter card tag. SSR and RouteSeo now own the complete head.

- [ ] Step 5: Run npm run build:ssr.

Expected: route metadata assertions pass. If structured-data assertions are the first remaining failure, record that as the next RED checkpoint.

- [ ] Step 6: Commit the metadata layer.

~~~powershell
git add -- icarecenter-frontend/src/shared/seo/RouteSeo.tsx icarecenter-frontend/src/app/App.tsx icarecenter-frontend/index.html
git commit -m "feat: centralize public route SEO metadata"
~~~

---

### Task 3: Add compliant Church structured data without alias leakage

**Files:**
- Create: icarecenter-frontend/src/shared/seo/organization-structured-data.ts
- Modify: icarecenter-frontend/src/user/home/pages/HomePage.tsx
- Modify: icarecenter-frontend/src/user/about/pages/AboutPage.tsx
- Modify: icarecenter-frontend/src/user/service-times/pages/ServicesPage.tsx
- Modify: icarecenter-frontend/scripts/verify-search-association.mjs

**Interfaces:**
- createChurchStructuredData(churchInfo: ChurchInfo | null) consumes optional configured data and returns JSON-safe Schema.org data.
- The result always uses the visible brand and canonical site URL and always sets alternateName to the approved former name.
- Optional address, telephone, and email fields are included only when configured.

- [ ] Step 1: Add the failing structured-data assertions.

~~~js
const homeStructuredData = JSON.parse(structuredDataMatch[1]);
if (homeStructuredData["@id"] !== seoConfig.siteUrl + "/#church") {
  throw new Error("Home page JSON-LD must expose the canonical Church @id");
}
if (homeStructuredData.name !== seoConfig.brandName) {
  throw new Error("Home page JSON-LD must use the visible organization name");
}
if (homeStructuredData.alternateName !== legacyName) {
  throw new Error("Home page JSON-LD must preserve the approved alternate name");
}
if (homeStructuredData.url !== seoConfig.siteUrl) {
  throw new Error("Home page JSON-LD must use the canonical site URL");
}
if (homeStructuredData.areaServed?.name !== "Olongapo City") {
  throw new Error("Home page JSON-LD must identify the service area");
}
~~~

Run npm run build:ssr and expect a failure because the current JSON-LD has no @id or areaServed.

- [ ] Step 2: Create organization-structured-data.ts.

~~~ts
import seoConfig from "./seo-config.json";
import type { ChurchInfo } from "@/domains/church-info/model/church-info.types";

const LEGACY_NAME = "I Care Fellowship";

export function createChurchStructuredData(churchInfo: ChurchInfo | null) {
  const hasAddress = Boolean(churchInfo?.address || churchInfo?.city || churchInfo?.state || churchInfo?.zip);
  const address = hasAddress
    ? {
        "@type": "PostalAddress",
        ...(churchInfo?.address ? { streetAddress: churchInfo.address } : {}),
        ...(churchInfo?.city ? { addressLocality: churchInfo.city } : {}),
        ...(churchInfo?.state ? { addressRegion: churchInfo.state } : {}),
        ...(churchInfo?.zip ? { postalCode: churchInfo.zip } : {}),
        addressCountry: "PH",
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": seoConfig.siteUrl + "/#church",
    name: seoConfig.brandName,
    alternateName: LEGACY_NAME,
    url: seoConfig.siteUrl,
    logo: seoConfig.siteUrl + seoConfig.socialImagePath.replaceAll(" ", "%20"),
    image: seoConfig.siteUrl + "/during%20worship%202.jpeg",
    areaServed: { "@type": "City", name: "Olongapo City" },
    ...(churchInfo?.phone ? { telephone: churchInfo.phone } : {}),
    ...(churchInfo?.email ? { email: churchInfo.email } : {}),
    ...(address ? { address } : {}),
  };
}
~~~

Do not add sameAs values until they are verified official profiles controlled by the church.

- [ ] Step 3: Use the builder only for home-page JSON-LD.

In HomePage.tsx, keep useChurchInfo and replace the current static home-seo import and Helmet title/meta/keywords/canonical tags with:

~~~tsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify(createChurchStructuredData(churchInfo ?? null))}
  </script>
</Helmet>
~~~

Remove the keywords meta tag. The alias must not be added to visible strings or ordinary metadata.

- [ ] Step 4: Remove duplicate page-local metadata.

Remove Helmet imports and blocks from AboutPage.tsx and ServicesPage.tsx; RouteSeo owns their titles and descriptions. Delete home-seo.ts only after this command has no matches:

~~~powershell
rg -n "HOME_PAGE_STRUCTURED_DATA|home-seo" icarecenter-frontend/src
~~~

- [ ] Step 5: Run npm run build:ssr.

Expected: Church JSON-LD assertions pass, and the verifier confirms the former name occurs only inside parsed JSON-LD alternateName, never in ordinary head tags or rendered body HTML.

- [ ] Step 6: Commit the structured-data change.

~~~powershell
git add -- icarecenter-frontend/src/shared/seo/organization-structured-data.ts icarecenter-frontend/src/user/home/pages/HomePage.tsx icarecenter-frontend/src/user/about/pages/AboutPage.tsx icarecenter-frontend/src/user/service-times/pages/ServicesPage.tsx icarecenter-frontend/scripts/verify-search-association.mjs
git rm -- icarecenter-frontend/src/user/home/home-seo.ts
git commit -m "feat: strengthen Church structured data"
~~~

---

### Task 4: Use one public route list for both sitemap paths

**Files:**
- Modify: icarecenter-frontend/netlify/scripts/generate-sitemap.js
- Modify: icarecenter-frontend/server.js
- Modify: icarecenter-frontend/public/robots.txt
- Modify: icarecenter-frontend/scripts/verify-search-association.mjs

**Interfaces:**
- Both sitemap producers consume src/shared/seo/seo-config.json and src/shared/seo/public-routes.json.
- Both producers output the same URLs, change frequencies, and priorities.
- robots.txt points only to the canonical sitemap and does not mention the former name.

- [ ] Step 1: Add the sitemap consistency assertions.

~~~js
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
const expectedSitemapUrls = publicPaths.map((routePath) => seoConfig.siteUrl + routePath);

if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls)) {
  throw new Error("Generated sitemap must exactly match the approved public route list");
}
if (sitemap.includes(legacyName) || sitemap.includes("icare-fellowship")) {
  throw new Error("The approved alternate name leaked into sitemap output");
}
~~~

Run npm run build:ssr and expect failure because the generator and server route still use different hard-coded URL arrays.

- [ ] Step 2: Update the build-time sitemap generator.

Read the shared JSON files with fs.readFileSync, XML-escape the configured URL and route path, and map every route to one url element. Use seoConfig.siteUrl rather than process.env.URL so deploy previews cannot change canonical URLs.

- [ ] Step 3: Update the SSR sitemap route.

In server.js, load the same JSON files through the existing resolve helper and replace the hard-coded urls array with the shared route entries. Keep Content-Type application/xml and use the same XML escaping logic as the build script.

- [ ] Step 4: Simplify robots.txt.

Use exactly:

~~~text
User-agent: *
Allow: /

Sitemap: https://icarecenter.netlify.app/sitemap.xml
~~~

- [ ] Step 5: Run npm run build:ssr.

Expected: the generated sitemap contains exactly the nine approved public URLs, both sitemap implementations use the same route list, and no private route or former name appears.

- [ ] Step 6: Commit crawl-surface consistency.

~~~powershell
git add -- icarecenter-frontend/netlify/scripts/generate-sitemap.js icarecenter-frontend/server.js icarecenter-frontend/public/robots.txt icarecenter-frontend/scripts/verify-search-association.mjs
git commit -m "fix: unify sitemap and crawl directives"
~~~

---

### Task 5: Run the complete local quality gate and review the diff

**Files:**
- Verify: all files changed by Tasks 1-4.

- [ ] Step 1: Run formatting and lint verification.

From icarecenter-frontend:

~~~powershell
npm exec -- ultracite check
npm run typecheck
~~~

Expected: both commands exit 0 with no modified files required by the check.

- [ ] Step 2: Run the production build and search verification.

~~~powershell
npm run build:ssr
npm run verify:search-association
~~~

Expected: client build, SSR build, sitemap generation, and all search-association assertions pass.

- [ ] Step 3: Run CI-matching edge and architecture checks.

~~~powershell
npm run test:edge
npm run test:architecture -- --config trashAssetsBeforeRuns=false
~~~

Expected: existing edge-function and architecture suites pass without skipped or focused tests.

- [ ] Step 4: Run the public browser smoke suite.

Start Vite in a separate PowerShell process, wait for http://127.0.0.1:8080, then run:

~~~powershell
npx cypress run --config-file ../icarecenter-test/cypress.config.cjs --spec ../icarecenter-test/e2e/user/index/index.cy.js,../icarecenter-test/e2e/user/gallery/gallery.cy.js,../icarecenter-test/e2e/sermons/youtube-livestream.cy.ts --config trashAssetsBeforeRuns=false
~~~

Expected: existing public-page behavior remains green; SEO head changes do not alter visible navigation or content.

- [ ] Step 5: Inspect the final diff and status.

~~~powershell
git diff --check
git status --short
git log -5 --oneline --decorate
~~~

Expected: no whitespace errors, only intended SEO files are modified, and each task commit is present.

- [ ] Step 6: If verification exposes a small formatting or assertion correction, fix it, rerun the affected command, and commit the correction.

~~~powershell
git add -- icarecenter-frontend docs/superpowers
git commit -m "chore: verify SEO implementation"
~~~

Do not claim completion until fresh command output confirms the final state.
