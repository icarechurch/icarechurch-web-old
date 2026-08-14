import { supabase } from "../client";

export type UpdateProfileParams = {
  id: string;
  full_name: string;
};

export type ProfileData = {
  full_name: string | null;
};

export const profileService = {
  async getProfile(userId: string): Promise<ProfileData> {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }
    return data as ProfileData;
  },

  async updateProfile(params: UpdateProfileParams): Promise<void> {
    const { error } = await supabase.from("profiles").upsert({
      id: params.id,
      full_name: params.full_name,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
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
