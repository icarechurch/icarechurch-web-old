import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { EVENT_POPUP_COLUMNS } from "./resource-columns.ts";

export function createEventPopupHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("event_popup_settings")
        .select(EVENT_POPUP_COLUMNS)
        .eq("singleton_key", true)
        .single();

      if (error?.code === "PGRST116") {
        return {
          id: "",
          singleton_key: true,
          event_id: null,
          is_enabled: false,
          created_at: "",
          updated_at: "",
        };
      }

      if (error) throw error;
      return data;
    },

    async upsert(params: { event_id: string | null; is_enabled: boolean }) {
      const payload = {
        singleton_key: true,
        event_id: params.event_id,
        is_enabled: params.is_enabled,
      };
      const { data, error } = await client
        .from("event_popup_settings")
        .upsert(payload, { onConflict: "singleton_key" })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  };
}
