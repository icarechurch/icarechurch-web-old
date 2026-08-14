import { supabase } from "../client";

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
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .order("sermon_date", { ascending: false });
    if (error) {
      throw error;
    }
    return data as Sermon[];
  },

  async getLatest(): Promise<Sermon | null> {
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .order("sermon_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data as Sermon | null;
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
