import { invokeFunction } from "../functions";

type SermonInsert = {
  title: string;
  description: string | null;
  sermon_date: string;
  pastor: string | null;
  video_url: string | null;
  audio_url: string | null;
};

type Sermon = SermonInsert & {
  id: string;
  created_at: string;
};

export const sermonsService = {
  async getAll(): Promise<Sermon[]> {
    return invokeFunction<Sermon[]>("content-data", {
      resource: "sermons",
      operation: "list",
    });
  },

  async getLatest(): Promise<Sermon | null> {
    return invokeFunction<Sermon | null>("content-data", {
      resource: "sermons",
      operation: "latest",
    });
  },

  async create(sermon: SermonInsert): Promise<Sermon> {
    const { data, error } = await supabase
      .from("sermons")
      .insert([sermon])
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Sermon;
  },

  async update(params: Partial<Sermon> & { id: string }): Promise<Sermon> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("sermons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Sermon;
  },

  async deleteSermon(id: string): Promise<string> {
    const { error } = await supabase.from("sermons").delete().eq("id", id);
    if (error) {
      throw error;
    }
    return id;
  },
};
