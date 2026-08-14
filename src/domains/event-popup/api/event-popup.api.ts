import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { EventPopupSettings, UpdateEventPopupSettingsParams } from "@/domains/event-popup/model/event-popup.types";

export const eventPopupApi = {
  async getSettings(): Promise<EventPopupSettings> {
    return invokeFunction<EventPopupSettings>("content-data", { resource: "event-popup", operation: "get" });
  },
  async upsertSettings(params: UpdateEventPopupSettingsParams): Promise<EventPopupSettings> {
    return invokeFunction<EventPopupSettings>("content-data", { resource: "event-popup", operation: "upsert", input: params });
  },
};
