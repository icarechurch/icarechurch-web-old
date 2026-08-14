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

    async create(sermon: unknown) {
      const { data, error } = await client
        .from("sermons")
        .insert([sermon])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(input: { id: string } & Record<string, unknown>) {
      const { id, ...updates } = input;
      const { data, error } = await client
        .from("sermons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(input: { id: string }) {
      const { error } = await client.from("sermons").delete().eq("id", input.id);

      if (error) throw error;
      return input.id;
    },
  };
}
