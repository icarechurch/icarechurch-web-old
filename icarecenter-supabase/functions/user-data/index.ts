import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createOptionsResponse } from "../_shared/cors.ts";
import { HttpError } from "../_shared/errors.ts";
import { parseRequest, type FunctionRequest } from "../_shared/request.ts";
import { failFromError, ok } from "../_shared/responses.ts";
import { createUserDataHandlers } from "./queries.ts";

export type UserDataHandler = (...args: never[]) => Promise<unknown>;
export type UserDataHandlers = Record<string, UserDataHandler>;

export async function dispatchUserDataRequest(
  request: FunctionRequest,
  handlers: UserDataHandlers,
): Promise<unknown> {
  const handler = handlers[`${request.resource}-${request.operation}`];
  if (!handler) {
    throw new HttpError(
      400,
      "INVALID_OPERATION",
      `Unsupported user data operation: ${request.resource}/${request.operation}`,
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

export async function handleUserDataRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchUserDataRequest(
      request,
      createUserDataHandlers(createRequestClient(req)),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleUserDataRequest);
}
