import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { Sermon, SermonInsert } from "@/domains/sermons/model/sermons.types";

export const sermonsApi = {
  async getAll(): Promise<Sermon[]> { return invokeFunction<Sermon[]>("content-data", { resource: "sermons", operation: "list" }); },
  async getLatest(): Promise<Sermon | null> { return invokeFunction<Sermon | null>("content-data", { resource: "sermons", operation: "latest" }); },
  async create(sermon: SermonInsert): Promise<Sermon> { return invokeFunction<Sermon>("content-data", { resource: "sermons", operation: "create", input: sermon }); },
  async update(params: Partial<Sermon> & { id: string }): Promise<Sermon> { return invokeFunction<Sermon>("content-data", { resource: "sermons", operation: "update", input: params }); },
  async deleteSermon(id: string): Promise<string> { return invokeFunction<string>("content-data", { resource: "sermons", operation: "delete", input: { id } }); },
};
