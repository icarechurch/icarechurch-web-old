import type { Database } from "../types";
import { supabase } from "../client";

export type EventPopupSettings =
  Database["public"]["Tables"]["event_popup_settings"]["Row"];
type EventPopupSettingsInsert =
  Database["public"]["Tables"]["event_popup_settings"]["Insert"];

type UpdateEventPopupSettingsParams = {
  event_id: string | null;
  is_enabled: boolean;
};

export const eventPopupService = {
  async getSettings(): Promise<EventPopupSettings> {
    const { data, error } = await supabase
      .from("event_popup_settings")
      .select("*")
      .eq("singleton_key", true)
      .single();

    if (error) {
      // Safe fallback when settings row is missing.
      if (error.code === "PGRST116") {
        return {
          id: "",
          singleton_key: true,
          event_id: null,
          is_enabled: false,
          created_at: "",
          updated_at: "",
        };
      }
      throw error;
    }

    return data;
  },

  async upsertSettings(
    params: UpdateEventPopupSettingsParams
  ): Promise<EventPopupSettings> {
    const payload: EventPopupSettingsInsert = {
      singleton_key: true,
      event_id: params.event_id,
      is_enabled: params.is_enabled,
    };

    const { data, error } = await supabase
      .from("event_popup_settings")
      .upsert(payload, { onConflict: "singleton_key" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
