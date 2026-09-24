import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GIVING_COLUMNS } from "./resource-columns.ts";

export function createGivingHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("giving_settings")
        .select(GIVING_COLUMNS)
        .single();

      if (error) throw error;
      return data;
    },

    async update(input: {
      id: string;
      updates: Record<string, unknown>;
    }) {
      const { error } = await client
        .from("giving_settings")
        .update(input.updates)
        .eq("id", input.id);

      if (error) throw error;
    },
  };
}
