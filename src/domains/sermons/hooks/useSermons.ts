import { sermonsApi } from "@/domains/sermons/api/sermons.api";
import type { Sermon, SermonInsert } from "@/domains/sermons/model/sermons.types";
import { logActivity } from "@/domains/activity-logs/hooks/useActivityLogs";
import { LOG_ACTION_TYPES } from "@/domains/activity-logs/model/logging.types";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useSermons() { return useQuery({ queryKey: ["sermons"], queryFn: async () => sermonsApi.getAll() }); }
export function useLatestSermon() { return useQuery({ queryKey: ["latest_sermon"], queryFn: async () => sermonsApi.getLatest() }); }
export function useSermonMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["sermons"] }); queryClient.invalidateQueries({ queryKey: ["latest_sermon"] }); };
  const createSermon = useMutation({ mutationFn: async (sermon: SermonInsert) => sermonsApi.create(sermon), onSuccess: (data) => { invalidate(); logActivity(LOG_ACTION_TYPES.CREATE_SERMON, { description: `Created sermon: ${data.title}`, entityType: "sermon", entityId: data.id }); } });
  const updateSermon = useMutation({ mutationFn: async ({ id, ...updates }: Partial<Sermon> & { id: string }) => sermonsApi.update({ id, ...updates }), onSuccess: (data) => { invalidate(); logActivity(LOG_ACTION_TYPES.UPDATE_SERMON, { description: `Updated sermon: ${data.title}`, entityType: "sermon", entityId: data.id }); } });
  const deleteSermon = useMutation({ mutationFn: async (id: string) => sermonsApi.deleteSermon(id), onSuccess: (id) => { invalidate(); logActivity(LOG_ACTION_TYPES.DELETE_SERMON, { description: "Deleted a sermon", entityType: "sermon", entityId: id }); } });
  return { createSermon, updateSermon, deleteSermon };
}
