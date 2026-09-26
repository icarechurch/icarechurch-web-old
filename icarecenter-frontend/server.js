import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express from "express";
import { createSitemapXml, loadSeoData } from "./seo/sitemap.mjs";

// const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Removing this to avoid CJS warning

export async function createServer({
  root = process.cwd(),
  isProd = true,
  hmrPort,
  renderPage,
} = {}) {
  const isTest = process.env.NODE_ENV === "test";
  const resolve = (p) => path.resolve(root, p);
  const { seoConfig, publicRoutes } = loadSeoData(root);

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : "";

  const app = express();

  app.use((_req, res, next) => {
    res.set(getSecurityHeaders(isProd));
    next();
  });

  // Sitemap route - must be before any other middleware to ensure it's handled first
  app.get("/sitemap.xml", (_req, res) => {
    const sitemap = createSitemapXml({
      publicRoutes,
      siteUrl: seoConfig.siteUrl,
    });

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
  } else if (!renderPage) {
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
      } else if (renderPage) {
        template = fs.readFileSync(resolve("index.html"), "utf-8");
      } else {
        // always read fresh template in dev
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      }

      const context = {};
      const appHtml = await (renderPage ?? render)(url, context);

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
    } catch (error) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(error);
      }
      const timestamp = new Date().toISOString();
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error("SSR render failed", { timestamp, errorName });
      res.status(500).end("Internal Server Error");
    }
  });

  return { app, vite };
}

const entrypoint = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;
const isMainModule = import.meta.url === entrypoint;

if (isMainModule) {
  const port = Number(process.env.PORT ?? "8081");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  createServer({})
    .then(({ app }) =>
      app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
      })
    )
    .catch((e) => {
      console.error("Server failed to start:", e);
      process.exit(1);
    });
}

process.on("unhandledRejection", (reason) => {
  const errorName = reason instanceof Error ? reason.name : "UnknownError";
  console.error("Unhandled rejection", { errorName });
});

function getSecurityHeaders(isProd) {
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  };

  if (isProd) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}
