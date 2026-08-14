import type { Database } from "@/infrastructure/supabase/types";

export type EventPopupSettings = Database["public"]["Tables"]["event_popup_settings"]["Row"];

export type UpdateEventPopupSettingsParams = {
  event_id: string | null;
  is_enabled: boolean;
};
