import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createProfileHandlers(client: SupabaseClient) {
  return {
    async get(input: { userId: string }) {
      const { data, error } = await client
        .from("profiles")
        .select("full_name")
        .eq("id", input.userId)
        .single();

      if (error) throw error;
      return data;
    },

    async upsert(profile: unknown) {
      const { error } = await client
        .from("profiles")
        .upsert(profile as Record<string, unknown>);

      if (error) throw error;
      return null;
    },

    async "update-name"(input: { userId: string; fullName: string }) {
      const { error } = await client
        .from("profiles")
        .update({ full_name: input.fullName })
        .eq("id", input.userId);

      if (error) throw error;
      return null;
    },
  };
}
