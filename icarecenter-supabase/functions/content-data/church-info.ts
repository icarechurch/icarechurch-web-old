import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { CHURCH_INFO_COLUMNS } from "./resource-columns.ts";

export function createChurchInfoHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("church_info")
        .select(CHURCH_INFO_COLUMNS)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  };
}
