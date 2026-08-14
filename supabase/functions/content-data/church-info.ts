import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createChurchInfoHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("church_info")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  };
}
