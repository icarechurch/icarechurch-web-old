import { supabase } from "../client";

export type ChurchInfo = {
  id: string;
  church_name: string | null;
  pastor_name: string | null;
  pastor_email: string | null;
  pastor_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  office_hours: string | null;
  fallback_stream_url: string | null;
  created_at: string;
  updated_at: string;
};

export const churchInfoService = {
  async getChurchInfo(): Promise<ChurchInfo | null> {
    const { data, error } = await supabase
      .from("church_info")
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data as ChurchInfo | null;
  },

  async update(
    params: Partial<ChurchInfo> & { id: string }
  ): Promise<ChurchInfo> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("church_info")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as ChurchInfo;
  },
};
