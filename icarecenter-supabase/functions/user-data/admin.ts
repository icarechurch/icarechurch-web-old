import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createAdminHandlers(client: SupabaseClient) {
  return {
    async list() {
      const { data, error } = await client.rpc("get_admin_users", {});

      if (error) throw error;
      return data ?? [];
    },
  };
}
