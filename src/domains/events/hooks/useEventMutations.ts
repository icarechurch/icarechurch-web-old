import { eventsService } from "@/domains/events/api/events.api";
import type { Event, EventInsert } from "@/domains/events/model/events.types";
import { logActivity } from "@/hooks/useLogs";
import { LOG_ACTION_TYPES } from "@/integrations/supabase/loggingTypes";
import { useMutation, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useEventMutations() {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (event: EventInsert) => eventsService.create(event),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      logActivity(LOG_ACTION_TYPES.CREATE_EVENT, {
        description: `Created event: ${data.title}`,
        entityType: "event",
        entityId: data.id,
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) =>
      eventsService.update({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      logActivity(LOG_ACTION_TYPES.UPDATE_EVENT, {
        description: `Updated event: ${data.title}`,
        entityType: "event",
        entityId: data.id,
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => eventsService.deleteEvent(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      logActivity(LOG_ACTION_TYPES.DELETE_EVENT, {
        description: "Deleted an event",
        entityType: "event",
        entityId: id,
      });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
}
