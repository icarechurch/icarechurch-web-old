import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  EventPopupRepository,
  EventPopupSettings,
} from "../domain/ports/EventPopupRepository.ts";
import { EVENT_POPUP_COLUMNS } from "./event-popup-columns.ts";

const MISSING_EVENT_POPUP_CODE = "PGRST116";

const missingEventPopupSettings = {
  id: "",
  singleton_key: true,
  event_id: null,
  is_enabled: false,
  created_at: "",
  updated_at: "",
} as const;

export class SupabaseEventPopupRepository implements EventPopupRepository {
  constructor(private readonly client: SupabaseClient) {}

  async get(): Promise<unknown> {
    const { data, error } = await this.client
      .from("event_popup_settings")
      .select(EVENT_POPUP_COLUMNS)
      .eq("singleton_key", true)
      .single();

    if (error?.code === MISSING_EVENT_POPUP_CODE) {
      return missingEventPopupSettings;
    }

    if (error) throw error;
    return data;
  }

  async upsert(input: EventPopupSettings): Promise<unknown> {
    const payload = {
      singleton_key: true,
      event_id: input.event_id,
      is_enabled: input.is_enabled,
    };
    const { data, error } = await this.client
      .from("event_popup_settings")
      .upsert(payload, { onConflict: "singleton_key" })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }
}
