import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { GivingRepository } from "../domain/ports/GivingRepository.ts";
import { GIVING_COLUMNS } from "./giving-columns.ts";

export class SupabaseGivingRepository implements GivingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async get(): Promise<unknown> {
    const { data, error } = await this.client
      .from("giving_settings")
      .select(GIVING_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  }

  async update(input: {
    id: string;
    updates: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await this.client
      .from("giving_settings")
      .update(input.updates)
      .eq("id", input.id);

    if (error) throw error;
  }
}
