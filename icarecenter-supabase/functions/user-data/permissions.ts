import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createPermissionHandlers(client: SupabaseClient) {
  return {
    async "allowed-tabs"() {
      const { data, error } = await client.rpc("get_allowed_tabs");

      if (error) throw error;
      return data;
    },
  };
}
