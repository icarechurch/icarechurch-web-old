import { invokeFunction } from "../functions";

export type GivingSettings = {
  id: string;
  gcash_qr_url: string | null;
  donation_platform_name: string;
  donation_platform_url: string | null;
  created_at: string;
  updated_at: string;
};

export const givingService = {
  async getGivingSettings(): Promise<GivingSettings> {
    return invokeFunction<GivingSettings>("content-data", {
      resource: "giving",
      operation: "get",
    });
  },
};
