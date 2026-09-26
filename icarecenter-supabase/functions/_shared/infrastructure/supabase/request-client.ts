import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface EnvironmentReader {
  get(name: string): string | undefined;
}

export function createRequestSupabaseClient(
  request: Request,
  env: EnvironmentReader = Deno.env,
): SupabaseClient {
  const url = env.get("SUPABASE_URL");
  const anonKey = env.get("SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Supabase function environment is not configured");
  }

  const authorization = request.headers.get("Authorization");
  return createClient(url, anonKey, {
    global: authorization ? { headers: { Authorization: authorization } } : {},
  });
}
