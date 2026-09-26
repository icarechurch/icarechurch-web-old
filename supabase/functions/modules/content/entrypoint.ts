import { createOptionsResponse } from "../../_shared/cors.ts";
import { HttpError } from "../../_shared/errors.ts";
import { createRequestSupabaseClient } from "../../_shared/infrastructure/supabase/request-client.ts";
import { type FunctionRequest, parseRequest } from "../../_shared/request.ts";
import { failFromError, ok } from "../../_shared/responses.ts";
import {
  type ContentRoutes,
  createContentModule,
} from "./index.ts";

export async function dispatchContentRequest(
  request: FunctionRequest,
  handlers: ContentRoutes,
): Promise<unknown> {
  const handler = handlers[request.resource]?.[request.operation];

  if (!handler) {
    throw new HttpError(
      400,
      "INVALID_OPERATION",
      `Unsupported content operation: ${request.resource}/${request.operation}`,
    );
  }

  return handler(request.input as never);
}
export async function handleContentRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const client = createRequestSupabaseClient(req);
    const result = await dispatchContentRequest(
      request,
      createContentModule(client),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleContentRequest);
}
