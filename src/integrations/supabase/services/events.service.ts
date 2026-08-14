import { invokeFunction } from "@/infrastructure/supabase/functions";

type EventInsert = {
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  event_time: string | null;
  status: "scheduled" | "postponed" | "done";
};

type Event = EventInsert & {
  id: string;
  created_at: string;
};

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
