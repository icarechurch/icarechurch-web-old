import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createOptionsResponse } from "../_shared/cors.ts";
import { HttpError } from "../_shared/errors.ts";
import { parseRequest, type FunctionRequest } from "../_shared/request.ts";
import { failFromError, ok } from "../_shared/responses.ts";
import { createAnalyticsOverviewHandler } from "./overview.ts";
import { createAnalyticsHandlers } from "./queries.ts";

export type AnalyticsHandler = (...args: never[]) => Promise<unknown>;
export type AnalyticsHandlers = Record<string, AnalyticsHandler>;

export async function dispatchAnalyticsRequest(
  request: FunctionRequest,
  handlers: AnalyticsHandlers,
): Promise<unknown> {
  if (request.resource !== "analytics") {
    throw new HttpError(
      400,
      "INVALID_RESOURCE",
      `Unsupported analytics resource: ${request.resource}`,
    );
  }

  const handler = handlers[request.operation];
  if (!handler) {
    throw new HttpError(
      400,
      "INVALID_OPERATION",
      `Unsupported analytics operation: ${request.operation}`,
    );
  }

  return handler(request.input as never);
}

export function createAnalyticsHandlersForClient(
  client: SupabaseClient,
): AnalyticsHandlers {
  return {
    ...createAnalyticsHandlers(client),
    overview: createAnalyticsOverviewHandler(client),
  };
}

function createRequestClient(req: Request): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Supabase function environment is not configured");
  }

  const authorization = req.headers.get("Authorization");
  return createClient(url, anonKey, {
    global: authorization ? { headers: { Authorization: authorization } } : {},
  });
}

export async function handleAnalyticsRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchAnalyticsRequest(
      request,
      createAnalyticsHandlersForClient(createRequestClient(req)),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleAnalyticsRequest);
}
