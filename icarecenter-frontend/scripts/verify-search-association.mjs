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
  /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/u,
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
].join("\n");
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
