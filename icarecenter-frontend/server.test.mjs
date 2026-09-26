import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "./server.js";

process.env.VITE_SUPABASE_URL ??= "https://ci.invalid";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??= "ci-placeholder-key";

const listen = async (app) => {
  const listener = app.listen(0);
  await new Promise((resolve) => listener.once("listening", resolve));
  return listener;
};

const close = async (listener, vite) => {
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve()))
  );
  await vite?.close();
};

test("SSR responses include baseline security headers", async () => {
  const { app, vite } = await createServer({ isProd: false });
  const listener = await listen(app);

  try {
    const { port } = listener.address();
    const response = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(
      response.headers.get("referrer-policy"),
      "strict-origin-when-cross-origin"
    );
    assert.equal(
      response.headers.get("permissions-policy"),
      "camera=(), geolocation=(), microphone=()"
    );
  } finally {
    await close(listener, vite);
  }
});

test("SSR failures return a generic response", async () => {
  const { app, vite } = await createServer({
    isProd: false,
    renderPage: () => {
      throw new Error("secret internal detail");
    },
  });
  const listener = await listen(app);

  try {
    const { port } = listener.address();
    const response = await fetch(`http://127.0.0.1:${port}/not-a-static-route`);
    const body = await response.text();
    assert.equal(response.status, 500);
    assert.equal(body, "Internal Server Error");
    assert.equal(body.includes("secret internal detail"), false);
  } finally {
    await close(listener, vite);
  }
});
