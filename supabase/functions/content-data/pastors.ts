import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createPastorHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("pastors")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  };
}
