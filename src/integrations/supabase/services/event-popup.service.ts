import type { Database } from "@/infrastructure/supabase/types";
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
    return invokeFunction<EventPopupSettings>("content-data", {
      resource: "event-popup",
      operation: "upsert",
      input: params,
    });
  },
};
