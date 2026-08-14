import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createOptionsResponse } from "../_shared/cors.ts";
import { HttpError } from "../_shared/errors.ts";
import { parseRequest, type FunctionRequest } from "../_shared/request.ts";
import { failFromError, ok } from "../_shared/responses.ts";
import { createActivityLogHandlers } from "./queries.ts";

export type ActivityLogHandler = (...args: never[]) => Promise<unknown>;
export type ActivityLogHandlers = Record<string, ActivityLogHandler>;

export async function dispatchActivityLogRequest(
  request: FunctionRequest,
  handlers: ActivityLogHandlers,
): Promise<unknown> {
  if (request.resource !== "activity-logs") {
    throw new HttpError(
      400,
      "INVALID_RESOURCE",
      `Unsupported activity log resource: ${request.resource}`,
    );
  }

  const handler = handlers[request.operation];
  if (!handler) {
    throw new HttpError(
      400,
      "INVALID_OPERATION",
      `Unsupported activity log operation: ${request.operation}`,
    );
  }

  return handler(request.input as never);
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

export async function handleActivityLogRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchActivityLogRequest(
      request,
      createActivityLogHandlers(createRequestClient(req)),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleActivityLogRequest);
}
