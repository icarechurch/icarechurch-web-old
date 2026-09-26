import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { ChurchInfoRepository } from "../domain/ports/ChurchInfoRepository.ts";
import { CHURCH_INFO_COLUMNS } from "./church-info-columns.ts";

export class SupabaseChurchInfoRepository implements ChurchInfoRepository {
  constructor(private readonly client: SupabaseClient) {}

  async get(): Promise<unknown | null> {
    const { data, error } = await this.client
      .from("church_info")
      .select(CHURCH_INFO_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
