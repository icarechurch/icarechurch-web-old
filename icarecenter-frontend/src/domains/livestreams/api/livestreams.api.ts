import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { Livestream } from "@/domains/livestreams/model/livestream.types";

export const livestreamsApi = {
  async getActive(): Promise<Livestream> {
    return invokeFunction<Livestream>("youtube-livestream", {
      resource: "livestream",
      operation: "get-active",
    });
  },
};
