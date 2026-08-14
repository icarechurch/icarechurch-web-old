import { serviceTimesApi } from "@/domains/service-times/api/service-times.api";
import type { ServiceTime, ServiceTimeInsert } from "@/domains/service-times/model/service-times.types";
import { logActivity } from "@/domains/activity-logs/hooks/useActivityLogs";
import { LOG_ACTION_TYPES } from "@/domains/activity-logs/model/logging.types";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useServiceTimes() {
  return useQuery({ queryKey: ["service_times"], queryFn: async () => serviceTimesApi.getServiceTimes() });
}

export function useServiceTimeMutations() {
  const queryClient = useQueryClient();
  const createServiceTime = useMutation({
    mutationFn: async (serviceTime: ServiceTimeInsert) => serviceTimesApi.create(serviceTime),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service_times"] });
      logActivity(LOG_ACTION_TYPES.CREATE_SERVICE_TIME, { description: `Created service time: ${data.name}`, entityType: "service_time", entityId: data.id });
    },
  });
  const updateServiceTime = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceTime> & { id: string }) => serviceTimesApi.update({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service_times"] });
      logActivity(LOG_ACTION_TYPES.UPDATE_SERVICE_TIME, { description: `Updated service time: ${data.name}`, entityType: "service_time", entityId: data.id });
    },
  });
  const deleteServiceTime = useMutation({
    mutationFn: async (id: string) => serviceTimesApi.deleteServiceTime(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["service_times"] });
      logActivity(LOG_ACTION_TYPES.DELETE_SERVICE_TIME, { description: "Deleted a service time", entityType: "service_time", entityId: id });
    },
  });
  const updateSortOrder = useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) => serviceTimesApi.updateSortOrder(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service_times"] }),
  });
  return { createServiceTime, updateServiceTime, deleteServiceTime, updateSortOrder };
}
