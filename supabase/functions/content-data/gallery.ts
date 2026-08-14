import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createGalleryHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(image: unknown) {
      const { data, error } = await client
        .from("gallery_images")
        .insert([image])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(input: { id: string }) {
      const { error } = await client
        .from("gallery_images")
        .delete()
        .eq("id", input.id);

      if (error) throw error;
      return input.id;
    },
  };
}
