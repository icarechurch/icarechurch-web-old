import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createUserHandlers(client: SupabaseClient) {
  return {
    async delete(input: { target_user_id: string }) {
      const { error } = await client.rpc("delete_user", {
        target_user_id: input.target_user_id,
      });

      if (error) throw error;
      return null;
    },
  };
}
