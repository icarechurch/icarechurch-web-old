import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { EventRepository } from "../domain/ports/EventRepository.ts";
import { EVENT_COLUMNS, MAX_PUBLIC_CONTENT_ROWS } from "./event-columns.ts";

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<unknown[]> {
    const { data, error } = await this.client
      .from("events")
      .select(EVENT_COLUMNS)
      .order("event_date", { ascending: true })
      .order("id", { ascending: true })
      .limit(MAX_PUBLIC_CONTENT_ROWS);

    if (error) throw error;
    return data;
  }

  async create(input: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("events")
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
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client.from("events").delete().eq(
      "id",
      input.id,
    );

    if (error) throw error;
    return input.id;
  }
}
