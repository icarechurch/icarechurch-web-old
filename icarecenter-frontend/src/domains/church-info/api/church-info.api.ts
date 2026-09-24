import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { ChurchInfo } from "@/domains/church-info/model/church-info.types";

export const churchInfoApi = {
  async getChurchInfo(): Promise<ChurchInfo | null> { return invokeFunction<ChurchInfo | null>("content-data", { resource: "church-info", operation: "get" }); },
  async update(params: Partial<ChurchInfo> & { id: string }): Promise<ChurchInfo> { return invokeFunction<ChurchInfo>("content-data", { resource: "church-info", operation: "update", input: params }); },
};
