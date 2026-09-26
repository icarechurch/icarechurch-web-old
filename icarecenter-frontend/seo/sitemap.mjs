import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadSeoData(frontendRoot) {
  const seoDirectory = path.resolve(frontendRoot, "src/shared/seo");

  return {
    seoConfig: readJson(path.join(seoDirectory, "seo-config.json")),
    publicRoutes: readJson(path.join(seoDirectory, "public-routes.json")),
  };
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createSitemapXml({ siteUrl, publicRoutes }) {
  const urls = publicRoutes
    .map(
      (route) => `
    <url>
        <loc>${escapeXml(`${siteUrl}${route.path}`)}</loc>
        <changefreq>${escapeXml(route.changefreq)}</changefreq>
        <priority>${escapeXml(route.priority)}</priority>
    </url>
    `,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}
