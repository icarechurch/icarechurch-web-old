import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  PastorRepository,
  PastorSortItem,
} from "../domain/ports/PastorRepository.ts";
import { MAX_PUBLIC_CONTENT_ROWS, PASTOR_COLUMNS } from "./pastor-columns.ts";

export class SupabasePastorRepository implements PastorRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<unknown[]> {
    const { data, error } = await this.client
      .from("pastors")
      .select(PASTOR_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(MAX_PUBLIC_CONTENT_ROWS);

    if (error) throw error;
    return data;
  }

  async create(pastor: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("pastors")
      .insert([pastor])
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
      .from("pastors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client.from("pastors").delete().eq(
      "id",
      input.id,
    );

    if (error) throw error;
    return input.id;
  }

  async sort(items: PastorSortItem[]): Promise<PastorSortItem[]> {
    const updates = items.map((item) =>
      this.client
        .from("pastors")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
    );
    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) throw errors[0].error;
    return items;
  }
}
