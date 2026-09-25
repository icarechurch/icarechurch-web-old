# Legacy Search Association Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a non-rendered home-page Church structured-data signal for the church's former name without changing the canonical URL, visible content, or route structure.

**Architecture:** Define the home-page JSON-LD payload in a focused SEO module and render it through the existing `react-helmet-async` boundary. Add a built-SSR verification script to parse the rendered Helmet output and fail if the former name leaks into titles, meta tags, links, rendered body HTML, or sitemap URLs.

**Tech Stack:** React 18, TypeScript, Vite SSR, `react-helmet-async`, Node.js ESM scripts, npm, Ultracite, Cypress.

## Global Constraints

- The former name may appear only in non-rendered structured data in site source/output.
- The former name must not appear in site URLs, route names, canonical URL, page title, meta description, Open Graph content, Twitter metadata, navigation, or rendered page content.
- The canonical site URL remains `https://icarecenter.netlify.app/`.
- Do not add redirects, old-name routes, visible hidden text, CSS-hidden keyword blocks, keyword stuffing, cloaking, or de-indexing instructions.
- Preserve all existing CI checks and run `npm run typecheck`, `npm run test:edge`, `npm run test:architecture -- --config trashAssetsBeforeRuns=false`, and `npm run build:ssr` from `icarecenter-frontend/` before completion.

---

### Task 1: Define the home-page structured-data payload

**Files:**
- Create: `icarecenter-frontend/src/user/home/home-seo.ts`
- Modify: `icarecenter-frontend/src/user/home/pages/HomePage.tsx:1-27`

**Interfaces:**
- Produces `HOME_PAGE_STRUCTURED_DATA`, a readonly JSON-serializable object consumed by `HomePage`.

- [x] **Step 1: Create the focused SEO data module**

Create `icarecenter-frontend/src/user/home/home-seo.ts` with a readonly payload whose authoritative identity and URL use the current public brand, and whose only historical-name occurrence is `alternateName`:

```ts
export const HOME_PAGE_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: "I Care Center - The Refuge Church",
  alternateName: "I Care Fellowship",
  url: "https://icarecenter.netlify.app/",
} as const;
```

- [x] **Step 2: Render the payload through the existing Helmet boundary**

Import `HOME_PAGE_STRUCTURED_DATA` into `HomePage.tsx` and add this child inside the existing `<Helmet>` block, after the canonical link:

```tsx
<script type="application/ld+json">
  {JSON.stringify(HOME_PAGE_STRUCTURED_DATA)}
</script>
```

Do not change the existing title, description, canonical URL, visible JSX, navigation, or route definitions.

- [x] **Step 3: Run the focused static checks**

Run from `icarecenter-frontend/`:

```powershell
npm run typecheck
npm exec -- ultracite check
```

Expected: both commands exit with code 0.

### Task 2: Add SSR regression verification

**Files:**
- Create: `icarecenter-frontend/scripts/verify-search-association.mjs`
- Modify: `icarecenter-frontend/package.json:12-23`

**Interfaces:**
- Consumes the built `dist/server/entry-server.js` renderer and `dist/client/sitemap.xml`.
- Produces a non-zero exit code with a descriptive error when structured-data or legacy-name placement rules fail.

- [x] **Step 1: Add a verification script that exercises the built SSR renderer**

Create `icarecenter-frontend/scripts/verify-search-association.mjs` with this behavior:

```js
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const legacyName = "I Care Fellowship";
const serverEntry = path.resolve("dist/server/entry-server.js");
const sitemapPath = path.resolve("dist/client/sitemap.xml");

const { render } = await import(pathToFileURL(serverEntry).href);
const { html, helmet } = render("/");
const structuredDataMarkup = helmet.script.toString();
const structuredDataMatch = structuredDataMarkup.match(
  /<script[^>]*application\\/ld\\+json[^>]*>([\\s\\S]*?)<\\/script>/u,
);

if (!structuredDataMatch) {
  throw new Error("Home page JSON-LD structured data was not rendered");
}

const structuredData = JSON.parse(structuredDataMatch[1]);
if (structuredData["@type"] !== "Church") {
  throw new Error("Home page JSON-LD must describe a Church");
}
if (structuredData.alternateName !== legacyName) {
  throw new Error("Home page JSON-LD must preserve the approved alternate name");
}
if (structuredData.url !== "https://icarecenter.netlify.app/") {
  throw new Error("Home page JSON-LD must use the canonical site URL");
}

const nonStructuredHead = [
  helmet.title.toString(),
  helmet.meta.toString(),
  helmet.link.toString(),
].join("\\n");
if (nonStructuredHead.includes(legacyName)) {
  throw new Error("The approved alternate name leaked into visible SEO metadata");
}
if (html.includes(legacyName)) {
  throw new Error("The approved alternate name leaked into rendered page content");
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
if (sitemap.includes(legacyName) || sitemap.includes("icare-fellowship")) {
  throw new Error("The approved alternate name leaked into sitemap URLs");
}

console.log("Search-association structured data verified");
```

- [x] **Step 2: Wire the verification into the existing SSR build gate**

Update `icarecenter-frontend/package.json` scripts to add:

```json
"verify:search-association": "node scripts/verify-search-association.mjs"
```

Then append `npm run verify:search-association` to the existing `build:ssr` command after sitemap generation:

```json
"build:ssr": "npm run build:client && npm run build:server && node netlify/scripts/generate-sitemap.js && npm run verify:search-association"
```

- [x] **Step 3: Run the regression verifier through the full SSR build**

Run from `icarecenter-frontend/`:

```powershell
npm run build:ssr
```

Expected: client build, server build, sitemap generation, and `Search-association structured data verified` all complete with exit code 0.

### Task 3: Run the repository CI-equivalent checks

**Files:**
- Modify: none

- [x] **Step 1: Run type checking**

```powershell
npm run typecheck
```

Expected: exit code 0.

- [x] **Step 2: Run the edge-function tests**

```powershell
npm run test:edge
```

Expected: exit code 0 with no skipped or focused tests.

- [x] **Step 3: Run the architecture test lane**

```powershell
npm run test:architecture -- --config trashAssetsBeforeRuns=false
```

Expected: exit code 0 and the existing frontend data-access architecture spec passes.

- [x] **Step 4: Run the final diff and source-placement audit**

```powershell
git diff --check
git status --short
```

Confirm the only implementation files are the SEO module, home page, package scripts, and verifier; confirm the former name is present only in the approved structured-data source and verifier assertions, never in a URL or visible page text.

- [x] **Step 5: Commit the implementation**

```powershell
git add icarecenter-frontend/src/user/home/home-seo.ts icarecenter-frontend/src/user/home/pages/HomePage.tsx icarecenter-frontend/scripts/verify-search-association.mjs icarecenter-frontend/package.json
git commit -m "feat: associate former church name in structured data"
```
