import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createSitemapXml,
  loadSeoData,
} from "../../seo/sitemap.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "../..");
const { seoConfig, publicRoutes } = loadSeoData(frontendRoot);
const sitemap = createSitemapXml({
  publicRoutes,
  siteUrl: seoConfig.siteUrl,
});

const outputDir = path.resolve(__dirname, "../../dist/client");
const outputPath = path.join(outputDir, "sitemap.xml");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, sitemap.trim());
console.log(`Sitemap generated at: ${outputPath}`);
