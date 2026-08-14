import { eventPopupService } from "@/integrations/supabase/services";
import { useMutation, useQuery, useQueryClient } from "./simple-query-hooks";

type UpdateEventPopupSettingsParams = {
  event_id: string | null;
  is_enabled: boolean;
};

export function useEventPopupSettings() {
  return useQuery({
    queryKey: ["event-popup-settings"],
    queryFn: async () => eventPopupService.getSettings(),
  });
}

export function useUpdateEventPopupSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateEventPopupSettingsParams) =>
      eventPopupService.upsertSettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-popup-settings"] });
    },
  });
}
