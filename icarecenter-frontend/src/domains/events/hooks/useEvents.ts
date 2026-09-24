import { eventsService } from "@/domains/events/api/events.api";
import { useQuery } from "@/shared/hooks/simple-query-hooks";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => eventsService.getAll(),
  });
}
