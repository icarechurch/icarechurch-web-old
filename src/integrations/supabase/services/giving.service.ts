import { supabase } from "../client";

export type GivingSettings = {
  id: string;
  gcash_qr_url: string | null;
  donation_platform_name: string;
  donation_platform_url: string | null;
  created_at: string;
  updated_at: string;
};

export const givingService = {
  async getGivingSettings(): Promise<GivingSettings> {
    const { data, error } = await supabase
      .from("giving_settings")
      .select("*")
      .single();

    if (error) {
      throw error;
    }
    return data;
  },
};
