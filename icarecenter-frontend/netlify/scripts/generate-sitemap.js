import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = ["/", "/about", "/services", "/contact", "/sermons", "/gallery"];
const baseUrl = process.env.URL || "https://icarecenter.netlify.app";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (url) => `
    <url>
        <loc>${baseUrl}${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>${url === "/" ? "1.0" : "0.8"}</priority>
    </url>
    `
      )
      .join("")}
</urlset>`;

// Output directory (dist/client where Netlify publishes from)
const outputDir = path.resolve(__dirname, "../../dist/client");
const outputPath = path.join(outputDir, "sitemap.xml");

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write sitemap
fs.writeFileSync(outputPath, sitemap.trim());
console.log(`✅ Sitemap generated at: ${outputPath}`);
