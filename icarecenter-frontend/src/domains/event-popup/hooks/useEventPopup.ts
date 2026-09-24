import { eventPopupApi } from "@/domains/event-popup/api/event-popup.api";
import type { UpdateEventPopupSettingsParams } from "@/domains/event-popup/model/event-popup.types";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useEventPopupSettings() { return useQuery({ queryKey: ["event-popup-settings"], queryFn: async () => eventPopupApi.getSettings() }); }
export function useUpdateEventPopupSettings() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (params: UpdateEventPopupSettingsParams) => eventPopupApi.upsertSettings(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-popup-settings"] }) });
}
