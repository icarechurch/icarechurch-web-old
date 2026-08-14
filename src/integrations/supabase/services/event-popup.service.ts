import type { Database } from "../types";
import { invokeFunction } from "../functions";

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
    return invokeFunction<EventPopupSettings>("content-data", {
      resource: "event-popup",
      operation: "get",
    });
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
