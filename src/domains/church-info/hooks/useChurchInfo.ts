import { churchInfoApi } from "@/domains/church-info/api/church-info.api";
import type { ChurchInfo } from "@/domains/church-info/model/church-info.types";
import { logActivity } from "@/domains/activity-logs/hooks/useActivityLogs";
import { LOG_ACTION_TYPES } from "@/domains/activity-logs/model/logging.types";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useChurchInfo() { return useQuery({ queryKey: ["church_info"], queryFn: async () => churchInfoApi.getChurchInfo() }); }
export function useChurchInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async ({ id, ...updates }: Partial<ChurchInfo> & { id: string }) => churchInfoApi.update({ id, ...updates }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["church_info"] }); logActivity(LOG_ACTION_TYPES.UPDATE_CHURCH_INFO, { description: "Updated church information", entityType: "church_info" }); } });
}
