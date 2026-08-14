import { HttpError } from "./errors.ts";

export type FunctionRequest = {
  resource: string;
  operation: string;
  input?: unknown;
};

export async function parseRequest(req: Request): Promise<FunctionRequest> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "INVALID_REQUEST", "Invalid request body");
  }

  if (!body || typeof body !== "object") {
    throw new HttpError(400, "INVALID_REQUEST", "Invalid request body");
  }

  const request = body as Record<string, unknown>;
  if (
    typeof request.resource !== "string" ||
    typeof request.operation !== "string"
  ) {
    throw new HttpError(
      400,
      "INVALID_REQUEST",
      "Resource and operation are required",
    );
  }

  return {
    resource: request.resource,
    operation: request.operation,
    input: request.input,
  };
}
