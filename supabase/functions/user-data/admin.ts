import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createAdminHandlers(client: SupabaseClient) {
  return {
    async list() {
      const [profilesResult, rolesResult] = await Promise.all([
        client.from("profiles").select("*"),
        client.from("user_roles").select("*"),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;

      return profilesResult.data.map((profile) => {
        const userRole = rolesResult.data?.find(
          (role) => role.user_id === profile.id,
        );
        return {
          ...profile,
          role: userRole ? userRole.role : "user",
        };
      });
    },
  };
}
