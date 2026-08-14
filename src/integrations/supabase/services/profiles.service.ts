import { supabase } from "@/infrastructure/supabase/client";
import { invokeFunction } from "@/infrastructure/supabase/functions";

export type UpdateProfileParams = {
  id: string;
  full_name: string;
};

export type ProfileData = {
  full_name: string | null;
};

export const profileService = {
  async getProfile(userId: string): Promise<ProfileData> {
    return invokeFunction<ProfileData>("user-data", {
      resource: "profiles",
      operation: "get",
      input: { userId },
    });
  },

  async updateProfile(params: UpdateProfileParams): Promise<void> {
    await invokeFunction<null>("user-data", {
      resource: "profiles",
      operation: "upsert",
      input: {
        id: params.id,
        full_name: params.full_name,
        updated_at: new Date().toISOString(),
      },
    });
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  },
};
