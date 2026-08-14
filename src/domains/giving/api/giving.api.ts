import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { GivingSettings } from "@/domains/giving/model/giving.types";

export type { GivingSettings } from "@/domains/giving/model/giving.types";

export const givingService = {
  async getGivingSettings(): Promise<GivingSettings> {
    return invokeFunction<GivingSettings>("content-data", {
      resource: "giving",
      operation: "get",
    });
  },

  async updateGivingSettings(
    id: string,
    updates: Partial<GivingSettings>,
  ): Promise<void> {
    await invokeFunction<null>("content-data", {
      resource: "giving",
      operation: "update",
      input: { id, updates },
    });
  },
};
