import { createOptionsResponse } from "../../_shared/cors.ts";
import { HttpError } from "../../_shared/errors.ts";
import { createRequestSupabaseClient } from "../../_shared/infrastructure/supabase/request-client.ts";
import { type FunctionRequest, parseRequest } from "../../_shared/request.ts";
import { failFromError, ok } from "../../_shared/responses.ts";
import {
  type AnalyticsRoutes,
  createAnalyticsModule,
} from "./index.ts";

export type AnalyticsHandlers = AnalyticsRoutes;

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

  return handler(request.input);
}

export async function handleAnalyticsRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchAnalyticsRequest(
      request,
      createAnalyticsModule(createRequestSupabaseClient(req)),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleAnalyticsRequest);
}
