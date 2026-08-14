import { supabase } from "../client";
import { invokeFunction } from "../functions";

export type AdminUserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user";
};

export const adminService = {
  async getAllUsersWithRoles(): Promise<AdminUserProfile[]> {
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      throw profilesError;
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      throw rolesError;
    }

    // Merge data
    const mergedUsers = profiles.map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: userRole ? userRole.role : "user",
      } as AdminUserProfile;
    });

    return mergedUsers;
  },

  async updateUserProfile(userId: string, fullName: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) {
      throw error;
    }
  },

  async updateGivingSettings(
    id: string,
    updates: {
      gcash_qr_url?: string | null;
      donation_platform_name?: string;
      donation_platform_url?: string | null;
    }
  ): Promise<void> {
    await invokeFunction<null>("content-data", {
      resource: "giving",
      operation: "update",
      input: { id, updates },
    });
  },
};
