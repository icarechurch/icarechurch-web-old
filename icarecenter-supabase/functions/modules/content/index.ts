import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type ContentHandler = (input: unknown) => Promise<unknown>;
export type ContentRoutes = Record<
  string,
  Record<string, ContentHandler>
>;

export function createContentModule(_client: SupabaseClient): ContentRoutes {
  return {};
}
