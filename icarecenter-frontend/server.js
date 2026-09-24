import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express from "express";

// const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Removing this to avoid CJS warning

export async function createServer({
  root = process.cwd(),
  isProd = true, // Force prod for verification
  hmrPort,
} = {}) {
  const isTest = process.env.NODE_ENV === "test";
  const resolve = (p) => path.resolve(root, p);

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : "";

  const app = express();

  // Sitemap route - must be before any other middleware to ensure it's handled first
  app.get("/sitemap.xml", (_req, res) => {
    const baseUrl = "https://icarecenter.netlify.app";
    const urls = ["/", "/about", "/services", "/contact", "/sermons"];

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

    res.set("Content-Type", "application/xml");
    return res.send(sitemap);
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (isProd) {
    app.use((await import("compression")).default());
    app.use(
      (await import("serve-static")).default(resolve("dist/client"), {
        index: false,
      })
    );
  } else {
    vite = await (await import("vite")).createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes this crashes
          // Chokidar.
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
        },
      },
      appType: "custom",
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  }

  app.use((req, res, next) => {
    if (req.path.startsWith("/assets/")) {
      return res.status(404).type("text/plain").send("Asset not found");
    }

    return next();
  });

  app.use(async (req, res, _next) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (isProd) {
        template = indexProd;
        // @ts-expect-error
        render = (
          await import(
            pathToFileURL(resolve("dist/server/entry-server.js")).href
          )
        ).render;
      } else {
        // always read fresh template in dev
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      }

      const context = {};
      const appHtml = render(url, context);

      // Extract HTML and Helmet data
      const { html, helmet } = appHtml;

      if (context.url) {
        // Somewhere a `<Redirect>` was rendered
        return res.redirect(301, context.url);
      }

      const htmlParts = [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
      ]
        .filter(Boolean)
        .join("\n");

      let finalHtml = template.replace("<!--app-head-->", htmlParts);
      finalHtml = finalHtml.replace("<!--app-html-->", html);

      res
        .status(200)
        .set({
          "Cache-Control": "public, max-age=0, must-revalidate",
          "Content-Type": "text/html",
        })
        .end(finalHtml);
    } catch (e) {
      if (!isProd) {
        vite.ssrFixStacktrace(e);
      }
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] SSR Error:\n${e.stack}\n\n`;
      console.error("SSR Error:", e.stack);
      fs.appendFile("server_error.log", logEntry, (writeErr) => {
        if (writeErr) console.error("Failed to write error log:", writeErr);
      });
      res.status(500).end("Internal Server Error");
    }
  });

  return { app, vite };
}

const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = process.env.PORT;
  createServer({})
    .then(({ app }) =>
      app.listen(port, () => {
        console.log(`✈️✈️✈️ http://localhost:${port}`);
      })
    )
    .catch((e) => {
      console.error("Server failed to start:", e);
      process.exit(1);
    });
}

process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
});

// Keep alive
setInterval(() => {
  // Keep the process alive
}, 10_000);
