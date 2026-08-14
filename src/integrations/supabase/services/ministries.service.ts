import { invokeFunction } from "../functions";

type MinistryInsert = {
  name: string;
  description: string | null;
  leader: string | null;
  meeting_time: string | null;
  image_url: string | null;
  sort_order: number | null;
  category: string;
};

type Ministry = MinistryInsert & {
  id: string;
};

export const ministriesService = {
  async getAll(): Promise<Ministry[]> {
    return invokeFunction<Ministry[]>("content-data", {
      resource: "ministries",
      operation: "list",
    });
  },

  async create(ministry: MinistryInsert): Promise<Ministry> {
    const { data, error } = await supabase
      .from("ministries")
      .insert([ministry])
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Ministry;
  },

  async update(params: Partial<Ministry> & { id: string }): Promise<Ministry> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("ministries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Ministry;
  },

  async deleteMinistry(id: string): Promise<string> {
    const { error } = await supabase.from("ministries").delete().eq("id", id);
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
        .from("ministries")
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
