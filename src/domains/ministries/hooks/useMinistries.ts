import { ministriesApi } from "@/domains/ministries/api/ministries.api";
import type { Ministry, MinistryInsert } from "@/domains/ministries/model/ministries.types";
import { logActivity } from "@/hooks/useLogs";
import { LOG_ACTION_TYPES } from "@/integrations/supabase/loggingTypes";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useMinistries() {
  return useQuery({ queryKey: ["ministries"], queryFn: async () => ministriesApi.getAll() });
}

export function useMinistryMutations() {
  const queryClient = useQueryClient();
  const createMinistry = useMutation({
    mutationFn: async (ministry: MinistryInsert) => ministriesApi.create(ministry),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      logActivity(LOG_ACTION_TYPES.CREATE_MINISTRY, { description: `Created ministry: ${data.name}`, entityType: "ministry", entityId: data.id });
    },
  });
  const updateMinistry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ministry> & { id: string }) => ministriesApi.update({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      logActivity(LOG_ACTION_TYPES.UPDATE_MINISTRY, { description: `Updated ministry: ${data.name}`, entityType: "ministry", entityId: data.id });
    },
  });
  const deleteMinistry = useMutation({
    mutationFn: async (id: string) => ministriesApi.deleteMinistry(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      logActivity(LOG_ACTION_TYPES.DELETE_MINISTRY, { description: "Deleted a ministry", entityType: "ministry", entityId: id });
    },
  });
  const updateSortOrder = useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) => ministriesApi.updateSortOrder(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ministries"] }),
  });
  return { createMinistry, updateMinistry, deleteMinistry, updateSortOrder };
}
