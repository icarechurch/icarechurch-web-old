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
    return invokeFunction<AdminUserProfile[]>("user-data", {
      resource: "admin",
      operation: "list",
    });
  },

  async updateUserProfile(userId: string, fullName: string): Promise<void> {
    await invokeFunction<null>("user-data", {
      resource: "profiles",
      operation: "update-name",
      input: { userId, fullName },
    });
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
