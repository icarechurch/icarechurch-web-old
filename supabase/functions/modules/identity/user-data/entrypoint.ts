import { createOptionsResponse } from "../../../_shared/cors.ts";
import { HttpError } from "../../../_shared/errors.ts";
import { createRequestSupabaseClient } from "../../../_shared/infrastructure/supabase/request-client.ts";
import { type FunctionRequest, parseRequest } from "../../../_shared/request.ts";
import { failFromError, ok } from "../../../_shared/responses.ts";
import {
  createUserDataModule,
  type UserDataRoutes,
} from "../index.ts";

export type UserDataHandlers = UserDataRoutes;

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

  return handler(request.input);
}

export async function handleUserDataRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const result = await dispatchUserDataRequest(
      request,
      createUserDataModule(createRequestSupabaseClient(req)),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleUserDataRequest);
}
