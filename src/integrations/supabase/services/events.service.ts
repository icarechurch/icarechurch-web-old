import { invokeFunction } from "../functions";

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
    const { data, error } = await supabase
      .from("events")
      .insert([event])
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Event;
  },

  async update(params: Partial<Event> & { id: string }): Promise<Event> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Event;
  },

  async deleteEvent(id: string): Promise<string> {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      throw error;
    }
    return id;
  },
};
