import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createGivingHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("giving_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  };
}
