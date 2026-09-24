import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createOptionsResponse } from "../_shared/cors.ts";
import { HttpError } from "../_shared/errors.ts";
import { parseRequest, type FunctionRequest } from "../_shared/request.ts";
import { failFromError, ok } from "../_shared/responses.ts";
import { createChurchInfoHandlers } from "./church-info.ts";
import { createEventHandlers } from "./events.ts";
import { createEventPopupHandlers } from "./event-popup.ts";
import { createGalleryHandlers } from "./gallery.ts";
import { createGivingHandlers } from "./giving.ts";
import { createMinistryHandlers } from "./ministries.ts";
import { createPastorHandlers } from "./pastors.ts";
import { createSermonHandlers } from "./sermons.ts";
import { createServiceTimeHandlers } from "./service-times.ts";

export type ContentHandler = (...args: never[]) => Promise<unknown>;
export type ContentHandlers = Record<
  string,
  Record<string, ContentHandler>
>;

export async function dispatchContentRequest(
  request: FunctionRequest,
  handlers: ContentHandlers,
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

export function createContentHandlers(client: SupabaseClient): ContentHandlers {
  return {
    ministries: createMinistryHandlers(client),
    events: createEventHandlers(client),
    "service-times": createServiceTimeHandlers(client),
    "church-info": createChurchInfoHandlers(client),
    sermons: createSermonHandlers(client),
    gallery: createGalleryHandlers(client),
    pastors: createPastorHandlers(client),
    "event-popup": createEventPopupHandlers(client),
    giving: createGivingHandlers(client),
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

export async function handleContentRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  try {
    const request = await parseRequest(req);
    const client = createRequestClient(req);
    const result = await dispatchContentRequest(
      request,
      createContentHandlers(client),
    );

    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

if (import.meta.main) {
  Deno.serve(handleContentRequest);
}
