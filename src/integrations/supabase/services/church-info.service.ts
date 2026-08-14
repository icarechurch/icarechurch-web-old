import { invokeFunction } from "../functions";

export type ChurchInfo = {
  id: string;
  church_name: string | null;
  pastor_name: string | null;
  pastor_email: string | null;
  pastor_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  office_hours: string | null;
  fallback_stream_url: string | null;
  created_at: string;
  updated_at: string;
};

export const churchInfoService = {
  async getChurchInfo(): Promise<ChurchInfo | null> {
    return invokeFunction<ChurchInfo | null>("content-data", {
      resource: "church-info",
      operation: "get",
    });
  },

  async update(
    params: Partial<ChurchInfo> & { id: string }
  ): Promise<ChurchInfo> {
    return invokeFunction<ChurchInfo>("content-data", {
      resource: "church-info",
      operation: "update",
      input: params,
    });
  },
};
