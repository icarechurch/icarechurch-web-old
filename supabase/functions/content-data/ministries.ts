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

    async create(ministry: unknown) {
      const { data, error } = await client
        .from("ministries")
        .insert([ministry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(input: { id: string } & Record<string, unknown>) {
      const { id, ...updates } = input;
      const { data, error } = await client
        .from("ministries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(input: { id: string }) {
      const { error } = await client
        .from("ministries")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
      return input.id;
    },

    async sort(items: Array<{ id: string; sort_order: number }>) {
      const updates = items.map((item) =>
        client
          .from("ministries")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id),
      );
      const results = await Promise.all(updates);
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) throw errors[0].error;
      return items;
    },
  };
}
