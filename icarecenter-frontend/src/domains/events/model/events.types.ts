export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  status: "scheduled" | "postponed" | "done";
  created_at: string;
  updated_at: string;
};

export type EventInsert = Omit<Event, "id" | "created_at" | "updated_at"> & {
  id?: string;
  status?: "scheduled" | "postponed" | "done";
};
