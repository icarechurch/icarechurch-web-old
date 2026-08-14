import { assertRole, requireBearerToken } from "./auth.ts";
import { createOptionsResponse } from "./cors.ts";
import { HttpError } from "./errors.ts";
import { parseRequest } from "./request.ts";
import { fail, ok } from "./responses.ts";

Deno.test("creates a 204 CORS preflight response", () => {
  const response = createOptionsResponse();

  if (response.status !== 204) {
    throw new Error(`Expected 204, received ${response.status}`);
  }

  if (!response.headers.get("Access-Control-Allow-Origin")) {
    throw new Error("Expected an allow-origin header");
  }
});

Deno.test("parses a valid function request", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({
      resource: "events",
      operation: "list",
      input: { days: 7 },
    }),
  });

  const parsed = await parseRequest(request);

  if (parsed.resource !== "events" || parsed.operation !== "list") {
    throw new Error("The request envelope was not parsed");
  }
});

Deno.test("returns stable success and error envelopes", async () => {
  const success = await ok({ id: "event-1" });
  const failure = await fail(400, "INVALID_REQUEST", "Bad request");

  if (success.status !== 200 || failure.status !== 400) {
    throw new Error("Unexpected response status");
  }

  const successBody = await success.json();
  const failureBody = await failure.json();

  if (successBody.data.id !== "event-1") {
    throw new Error("Success response did not contain data");
  }

  if (failureBody.error.code !== "INVALID_REQUEST") {
    throw new Error("Error response did not contain a code");
  }
});

Deno.test("exposes typed HTTP errors for request handlers", () => {
  const error = new HttpError(401, "UNAUTHORIZED", "Sign in required");

  if (error.status !== 401 || error.code !== "UNAUTHORIZED") {
    throw new Error("HttpError did not preserve its status and code");
  }
});

Deno.test("requires a bearer token and allowed role", () => {
  const request = new Request("http://localhost", {
    headers: { Authorization: "Bearer token-1" },
  });

  if (requireBearerToken(request) !== "Bearer token-1") {
    throw new Error("The authorization header was not preserved");
  }

  assertRole("admin", ["admin"]);
});
