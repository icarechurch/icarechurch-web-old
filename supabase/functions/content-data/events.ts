import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { EVENT_COLUMNS, MAX_PUBLIC_CONTENT_ROWS } from "./resource-columns.ts";

export function createEventHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("events")
        .select(EVENT_COLUMNS)
        .order("event_date", { ascending: true })
        .order("id", { ascending: true })
        .limit(MAX_PUBLIC_CONTENT_ROWS);

      if (error) throw error;
      return data;
    },

    async create(event: unknown) {
      const { data, error } = await client
        .from("events")
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(input: { id: string } & Record<string, unknown>) {
      const { id, ...updates } = input;
      const { data, error } = await client
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(input: { id: string }) {
      const { error } = await client.from("events").delete().eq("id", input.id);

      if (error) throw error;
      return input.id;
    },
  };
}
