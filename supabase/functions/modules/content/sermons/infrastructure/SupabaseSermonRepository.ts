import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { SermonRepository } from "../domain/ports/SermonRepository.ts";
import { MAX_PUBLIC_CONTENT_ROWS, SERMON_COLUMNS } from "./sermon-columns.ts";

export class SupabaseSermonRepository implements SermonRepository {
  public constructor(private readonly client: SupabaseClient) {}

  public async list(): Promise<unknown[]> {
    const { data, error } = await this.client
      .from("sermons")
      .select(SERMON_COLUMNS)
      .order("sermon_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(MAX_PUBLIC_CONTENT_ROWS);

    if (error) throw error;
    return data;
  }

  public async latest(): Promise<unknown | null> {
    const { data, error } = await this.client
      .from("sermons")
      .select(SERMON_COLUMNS)
      .order("sermon_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  public async create(input: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("sermons")
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    const { id, ...updates } = input;
    const { data, error } = await this.client
      .from("sermons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client.from("sermons").delete().eq(
      "id",
      input.id,
    );

    if (error) throw error;
    return input.id;
  }
}
