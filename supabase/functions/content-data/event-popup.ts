import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createEventPopupHandlers(client: SupabaseClient) {
  return {
    async get() {
      const { data, error } = await client
        .from("event_popup_settings")
        .select("*")
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
  };
}
