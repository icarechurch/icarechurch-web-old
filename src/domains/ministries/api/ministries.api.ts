import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { Ministry, MinistryInsert } from "@/domains/ministries/model/ministries.types";

export const ministriesApi = {
  async getAll(): Promise<Ministry[]> {
    return invokeFunction<Ministry[]>("content-data", { resource: "ministries", operation: "list" });
  },
  async create(ministry: MinistryInsert): Promise<Ministry> {
    return invokeFunction<Ministry>("content-data", { resource: "ministries", operation: "create", input: ministry });
  },
  async update(params: Partial<Ministry> & { id: string }): Promise<Ministry> {
    return invokeFunction<Ministry>("content-data", { resource: "ministries", operation: "update", input: params });
  },
  async deleteMinistry(id: string): Promise<string> {
    return invokeFunction<string>("content-data", { resource: "ministries", operation: "delete", input: { id } });
  },
  async updateSortOrder(items: Array<{ id: string; sort_order: number }>): Promise<Array<{ id: string; sort_order: number }>> {
    return invokeFunction<Array<{ id: string; sort_order: number }>>("content-data", { resource: "ministries", operation: "sort", input: items });
  },
};
