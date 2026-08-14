import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createServiceTimeHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("service_times")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  };
}
