import { createOptionsResponse } from "../../_shared/cors.ts";
import { HttpError } from "../../_shared/errors.ts";
import { createRequestSupabaseClient } from "../../_shared/infrastructure/supabase/request-client.ts";
import { type FunctionRequest, parseRequest } from "../../_shared/request.ts";
import { failFromError, ok } from "../../_shared/responses.ts";
import { type AuditRoutes, createAuditModule } from "./index.ts";

export type ActivityLogHandler = AuditRoutes[keyof AuditRoutes];
export type ActivityLogHandlers = AuditRoutes;

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

export async function handleActivityLogRequest(
  req: Request,
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchActivityLogRequest(
      request,
      createAuditModule(createRequestSupabaseClient(req)).activityLogs,
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleActivityLogRequest);
}
