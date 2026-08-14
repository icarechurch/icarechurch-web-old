import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { Event, EventInsert } from "@/domains/events/model/events.types";

export const eventsService = {
  async getAll(): Promise<Event[]> {
    return invokeFunction<Event[]>("content-data", {
      resource: "events",
      operation: "list",
    });
  },

  async create(event: EventInsert): Promise<Event> {
    return invokeFunction<Event>("content-data", {
      resource: "events",
      operation: "create",
      input: event,
    });
  },

  async update(params: Partial<Event> & { id: string }): Promise<Event> {
    return invokeFunction<Event>("content-data", {
      resource: "events",
      operation: "update",
      input: params,
    });
  },

  async deleteEvent(id: string): Promise<string> {
    return invokeFunction<string>("content-data", {
      resource: "events",
      operation: "delete",
      input: { id },
    });
  },
};
