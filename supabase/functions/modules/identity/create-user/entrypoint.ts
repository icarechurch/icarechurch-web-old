import { corsHeaders } from "../../../_shared/cors.ts";
import { toHttpError } from "../../../_shared/errors.ts";
import { createCreateUserModule } from "../index.ts";

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

function response(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

export async function handleCreateUserRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return response({ error: "Invalid request body" }, 400);
  }

  try {
    const result = await createCreateUserModule().execute(
      req.headers.get("Authorization"),
      input,
    );
    return response(result.body, result.status);
  } catch (error) {
    const httpError = toHttpError(error);
    return response({ error: httpError.message }, httpError.status);
  }
}

if (import.meta.main) {
  Deno.serve(handleCreateUserRequest);
}
