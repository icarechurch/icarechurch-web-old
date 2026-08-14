import { supabase } from "../client";

type PastorInsert = {
  name: string;
  title: string | null;
  bio: string | null;
  image_url: string | null;
  sort_order: number | null;
};

type Pastor = PastorInsert & {
  id: string;
  created_at: string;
};

export const pastorsService = {
  async getAll(): Promise<Pastor[]> {
    const { data, error } = await supabase
      .from("pastors")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      throw error;
    }
    return data as Pastor[];
  },

  async create(pastor: PastorInsert): Promise<Pastor> {
    const { data, error } = await supabase
      .from("pastors")
      .insert([pastor])
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Pastor;
  },

  async update(params: Partial<Pastor> & { id: string }): Promise<Pastor> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("pastors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Pastor;
  },

  async deletePastor(id: string): Promise<string> {
    const { error } = await supabase.from("pastors").delete().eq("id", id);
    if (error) {
      throw error;
    }
    return id;
  },

  async updateSortOrder(
    items: Array<{ id: string; sort_order: number }>
  ): Promise<Array<{ id: string; sort_order: number }>> {
    const updates = items.map((item) =>
      supabase
        .from("pastors")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
    );
    const results = await Promise.all(updates.map((u) => u));
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw errors[0].error;
    }
    return items;
  },
};
