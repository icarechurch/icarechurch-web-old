import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { Pastor, PastorInsert } from "@/domains/pastors/model/pastors.types";

export const pastorsApi = {
  async getAll(): Promise<Pastor[]> { return invokeFunction<Pastor[]>("content-data", { resource: "pastors", operation: "list" }); },
  async create(pastor: PastorInsert): Promise<Pastor> { return invokeFunction<Pastor>("content-data", { resource: "pastors", operation: "create", input: pastor }); },
  async update(params: Partial<Pastor> & { id: string }): Promise<Pastor> { return invokeFunction<Pastor>("content-data", { resource: "pastors", operation: "update", input: params }); },
  async deletePastor(id: string): Promise<string> { return invokeFunction<string>("content-data", { resource: "pastors", operation: "delete", input: { id } }); },
  async updateSortOrder(items: Array<{ id: string; sort_order: number }>): Promise<Array<{ id: string; sort_order: number }>> { return invokeFunction<Array<{ id: string; sort_order: number }>>("content-data", { resource: "pastors", operation: "sort", input: items }); },
};
