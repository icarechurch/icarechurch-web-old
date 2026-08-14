import type { Database } from "../types";
import { supabase } from "../client";

export type ServiceTime = Database["public"]["Tables"]["service_times"]["Row"];
type ServiceTimeInsert = Database["public"]["Tables"]["service_times"]["Insert"];
type ServiceTimeUpdate = Database["public"]["Tables"]["service_times"]["Update"];

export const serviceTimesService = {
  async getServiceTimes(): Promise<ServiceTime[]> {
    const { data, error } = await supabase
      .from("service_times")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  },

  async create(serviceTime: ServiceTimeInsert): Promise<ServiceTime> {
    const { data, error } = await supabase
      .from("service_times")
      .insert([serviceTime])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  async update(
    params: Partial<ServiceTimeUpdate> & { id: string }
  ): Promise<ServiceTime> {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from("service_times")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  async deleteServiceTime(id: string): Promise<string> {
    const { error } = await supabase
      .from("service_times")
      .delete()
      .eq("id", id);

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
        .from("service_times")
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
