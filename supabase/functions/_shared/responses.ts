import { corsHeaders } from "./cors.ts";
import { toHttpError } from "./errors.ts";

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: jsonHeaders,
  });
}

export function fail(
  status: number,
  code: string,
  message: string,
): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: jsonHeaders,
  });
}

export function failFromError(error: unknown): Response {
  const httpError = toHttpError(error);
  return fail(httpError.status, httpError.code, httpError.message);
}
