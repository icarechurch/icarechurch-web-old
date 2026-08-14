import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createRoleHandlers(client: SupabaseClient) {
  return {
    async get(input: { userId: string }) {
      const { data, error } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", input.userId)
        .maybeSingle();

      if (error || !data) return null;
      return data.role;
    },

    async create(input: { user_id: string; role: string }) {
      const { error } = await client.from("user_roles").insert({
        user_id: input.user_id,
        role: input.role,
      });

      if (error) throw error;
      return null;
    },

    async delete(input: { userId: string }) {
      const { error } = await client
        .from("user_roles")
        .delete()
        .eq("user_id", input.userId);

      if (error) throw error;
      return null;
    },

    async replace(input: { user_id: string; role: string }) {
      await client.from("user_roles").delete().eq("user_id", input.user_id);

      const { error } = await client.from("user_roles").insert({
        user_id: input.user_id,
        role: input.role,
      });

      if (error) throw error;
      return null;
    },
  };
}
