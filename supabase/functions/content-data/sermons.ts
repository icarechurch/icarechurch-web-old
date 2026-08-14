import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createSermonHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false });

      if (error) throw error;
      return data;
    },

    async latest() {
      const { data, error } = await client
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  };
}
