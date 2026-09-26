import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  ServiceTimeRepository,
  SortServiceTimeInput,
} from "../domain/ports/ServiceTimeRepository.ts";
import {
  MAX_SERVICE_TIME_ROWS,
  SERVICE_TIME_COLUMNS,
} from "./service-time-columns.ts";

export class SupabaseServiceTimeRepository implements ServiceTimeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<unknown> {
    const { data, error } = await this.client
      .from("service_times")
      .select(SERVICE_TIME_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(MAX_SERVICE_TIME_ROWS);

    if (error) throw error;
    return data;
  }

  async create(serviceTime: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("service_times")
      .insert([serviceTime])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    const { id, ...updates } = input;
    const { data, error } = await this.client
      .from("service_times")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client
      .from("service_times")
      .delete()
      .eq("id", input.id);

    if (error) throw error;
    return input.id;
  }

  async sort(items: SortServiceTimeInput): Promise<SortServiceTimeInput> {
    for (const item of items) {
      const { error } = await this.client
        .from("service_times")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);

      if (error) throw error;
    }

    return items;
  }
}
