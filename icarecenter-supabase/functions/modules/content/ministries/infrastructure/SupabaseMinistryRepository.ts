import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  MinistryRepository,
  MinistrySortItem,
} from "../domain/ports/MinistryRepository.ts";
import {
  MAX_PUBLIC_CONTENT_ROWS,
  MINISTRY_COLUMNS,
} from "./ministry-columns.ts";

export class SupabaseMinistryRepository implements MinistryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<unknown[]> {
    const { data, error } = await this.client
      .from("ministries")
      .select(MINISTRY_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(MAX_PUBLIC_CONTENT_ROWS);

    if (error) throw error;
    return data;
  }

  async create(input: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("ministries")
      .insert([input])
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
      .from("ministries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client
      .from("ministries")
      .delete()
      .eq("id", input.id);

    if (error) throw error;
    return input.id;
  }

  async sort(items: MinistrySortItem[]): Promise<MinistrySortItem[]> {
    for (const item of items) {
      const { error } = await this.client
        .from("ministries")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);

      if (error) throw error;
    }

    return items;
  }
}
