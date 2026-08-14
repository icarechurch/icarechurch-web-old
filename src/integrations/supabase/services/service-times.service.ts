import type { Database } from "../types";
import { invokeFunction } from "../functions";

export type ServiceTime = Database["public"]["Tables"]["service_times"]["Row"];
type ServiceTimeInsert = Database["public"]["Tables"]["service_times"]["Insert"];
type ServiceTimeUpdate = Database["public"]["Tables"]["service_times"]["Update"];

export const serviceTimesService = {
  async getServiceTimes(): Promise<ServiceTime[]> {
    return invokeFunction<ServiceTime[]>("content-data", {
      resource: "service-times",
      operation: "list",
    });
  },

  async create(serviceTime: ServiceTimeInsert): Promise<ServiceTime> {
    return invokeFunction<ServiceTime>("content-data", {
      resource: "service-times",
      operation: "create",
      input: serviceTime,
    });
  },

  async update(
    params: Partial<ServiceTimeUpdate> & { id: string }
  ): Promise<ServiceTime> {
    return invokeFunction<ServiceTime>("content-data", {
      resource: "service-times",
      operation: "update",
      input: params,
    });
  },

  async deleteServiceTime(id: string): Promise<string> {
    return invokeFunction<string>("content-data", {
      resource: "service-times",
      operation: "delete",
      input: { id },
    });
  },

  async updateSortOrder(
    items: Array<{ id: string; sort_order: number }>
  ): Promise<Array<{ id: string; sort_order: number }>> {
    return invokeFunction<Array<{ id: string; sort_order: number }>>(
      "content-data",
      { resource: "service-times", operation: "sort", input: items },
    );
  },
};
