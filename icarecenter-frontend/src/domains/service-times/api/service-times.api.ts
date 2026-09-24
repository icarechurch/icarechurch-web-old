import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { ServiceTime, ServiceTimeInsert } from "@/domains/service-times/model/service-times.types";

export const serviceTimesApi = {
  async getServiceTimes(): Promise<ServiceTime[]> {
    return invokeFunction<ServiceTime[]>("content-data", { resource: "service-times", operation: "list" });
  },
  async create(serviceTime: ServiceTimeInsert): Promise<ServiceTime> {
    return invokeFunction<ServiceTime>("content-data", { resource: "service-times", operation: "create", input: serviceTime });
  },
  async update(params: Partial<ServiceTime> & { id: string }): Promise<ServiceTime> {
    return invokeFunction<ServiceTime>("content-data", { resource: "service-times", operation: "update", input: params });
  },
  async deleteServiceTime(id: string): Promise<string> {
    return invokeFunction<string>("content-data", { resource: "service-times", operation: "delete", input: { id } });
  },
  async updateSortOrder(items: Array<{ id: string; sort_order: number }>): Promise<Array<{ id: string; sort_order: number }>> {
    return invokeFunction<Array<{ id: string; sort_order: number }>>("content-data", { resource: "service-times", operation: "sort", input: items });
  },
};
