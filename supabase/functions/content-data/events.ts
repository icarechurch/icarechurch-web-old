import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createEventHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  };
}
