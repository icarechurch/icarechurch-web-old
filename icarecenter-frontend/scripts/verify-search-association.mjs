import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const legacyName = "I Care Fellowship";
const structuredDataPattern =
  /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/u;
const privateRoutePattern =
  /^(\/auth|\/profile|\/admin|\/moderator|\/update-password)/u;
const sitemapUrlPattern = /<loc>([^<]+)<\/loc>/gu;
const serverEntry = path.resolve("dist/server/entry-server.js");
const sitemapPath = path.resolve("dist/client/sitemap.xml");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const seoConfig = readJson(path.resolve("src/shared/seo/seo-config.json"));
const publicRoutes = readJson(
  path.resolve("src/shared/seo/public-routes.json")
);
const publicPaths = publicRoutes.map(({ path: routePath }) => routePath);

const countMatches = (value, pattern) => value.match(pattern)?.length ?? 0;
const expectOne = (value, pattern, message) => {
  if (countMatches(value, pattern) !== 1) {
    throw new Error(message);
  }
};

const { render } = await import(pathToFileURL(serverEntry).href);
const { html, helmet } = render("/");
const structuredDataMarkup = helmet.script.toString();
const structuredDataMatch = structuredDataMarkup.match(structuredDataPattern);

if (!structuredDataMatch) {
  throw new Error("Home page JSON-LD structured data was not rendered");
}

const structuredData = JSON.parse(structuredDataMatch[1]);
if (structuredData["@type"] !== "Church") {
  throw new Error("Home page JSON-LD must describe a Church");
}
if (structuredData.alternateName !== legacyName) {
  throw new Error(
    "Home page JSON-LD must preserve the approved alternate name"
  );
}
if (structuredData.url !== `${seoConfig.siteUrl}/`) {
  throw new Error("Home page JSON-LD must use the canonical site URL");
}
if (structuredData["@id"] !== `${seoConfig.siteUrl}/#church`) {
  throw new Error("Home page JSON-LD must expose the canonical Church @id");
}
if (structuredData.name !== seoConfig.brandName) {
  throw new Error("Home page JSON-LD must use the visible organization name");
}
if (structuredData.areaServed?.name !== "Olongapo City") {
  throw new Error("Home page JSON-LD must identify the service area");
}

const nonStructuredHead = [
  helmet.title.toString(),
  helmet.meta.toString(),
  helmet.link.toString(),
].join("\n");
if (nonStructuredHead.includes(legacyName)) {
  throw new Error(
    "The approved alternate name leaked into visible SEO metadata"
  );
}
if (html.includes(legacyName)) {
  throw new Error(
    "The approved alternate name leaked into rendered page content"
  );
}

for (const route of publicRoutes) {
  const rendered = render(route.path);
  const head = [
    rendered.helmet.title.toString(),
    rendered.helmet.meta.toString(),
    rendered.helmet.link.toString(),
  ].join("\n");

  expectOne(head, /<title\b/gu, `${route.path} must emit one title`);
  expectOne(
    head,
    /name="description"/gu,
    `${route.path} must emit one description`
  );
  expectOne(
    head,
    /rel="canonical"/gu,
    `${route.path} must emit one canonical link`
  );
  expectOne(
    head,
    /property="og:title"/gu,
    `${route.path} must emit one Open Graph title`
  );
  expectOne(
    head,
    /property="og:description"/gu,
    `${route.path} must emit one Open Graph description`
  );

  const missingSeoCopy = [route.title, route.description].find(
    (value) => !head.includes(value)
  );
  if (missingSeoCopy) {
    throw new Error(`${route.path} must use its configured SEO copy`);
  }
  if (head.includes(legacyName) || rendered.html.includes(legacyName)) {
    throw new Error(`${route.path} leaked the approved alternate name`);
  }
}

if (publicPaths.some((routePath) => privateRoutePattern.test(routePath))) {
  throw new Error(
    "Private routes must not be present in the public route list"
  );
}

if (seoConfig.siteUrl !== "https://icarecenter.netlify.app") {
  throw new Error("SEO configuration must use the canonical production origin");
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapUrls = [...sitemap.matchAll(sitemapUrlPattern)].map(
  ([, url]) => url
);
const expectedSitemapUrls = publicPaths.map(
  (routePath) => seoConfig.siteUrl + routePath
);

if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls)) {
  throw new Error(
    "Generated sitemap must exactly match the approved public route list"
  );
}
if (sitemap.includes(legacyName) || sitemap.includes("icare-fellowship")) {
  throw new Error("The approved alternate name leaked into sitemap output");
}

console.log("Search-association structured data verified");
