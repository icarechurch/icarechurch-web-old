import { pastorsApi } from "@/domains/pastors/api/pastors.api";
import type { Pastor, PastorInsert } from "@/domains/pastors/model/pastors.types";
import { logActivity } from "@/hooks/useLogs";
import { LOG_ACTION_TYPES } from "@/integrations/supabase/loggingTypes";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function usePastors() { return useQuery({ queryKey: ["pastors"], queryFn: async () => pastorsApi.getAll() }); }
export function usePastorMutations() {
  const queryClient = useQueryClient();
  const createPastor = useMutation({ mutationFn: async (pastor: PastorInsert) => pastorsApi.create(pastor), onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["pastors"] }); logActivity(LOG_ACTION_TYPES.CREATE_PASTOR, { description: `Created pastor: ${data.name}`, entityType: "pastor", entityId: data.id }); } });
  const updatePastor = useMutation({ mutationFn: async ({ id, ...updates }: Partial<Pastor> & { id: string }) => pastorsApi.update({ id, ...updates }), onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["pastors"] }); logActivity(LOG_ACTION_TYPES.UPDATE_PASTOR, { description: `Updated pastor: ${data.name}`, entityType: "pastor", entityId: data.id }); } });
  const deletePastor = useMutation({ mutationFn: async (id: string) => pastorsApi.deletePastor(id), onSuccess: (id) => { queryClient.invalidateQueries({ queryKey: ["pastors"] }); logActivity(LOG_ACTION_TYPES.DELETE_PASTOR, { description: "Deleted a pastor", entityType: "pastor", entityId: id }); } });
  const updateSortOrder = useMutation({ mutationFn: async (items: Array<{ id: string; sort_order: number }>) => pastorsApi.updateSortOrder(items), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pastors"] }) });
  return { createPastor, updatePastor, deletePastor, updateSortOrder };
}
