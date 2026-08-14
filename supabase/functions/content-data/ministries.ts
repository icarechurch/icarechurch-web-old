import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createMinistryHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("ministries")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  };
}
