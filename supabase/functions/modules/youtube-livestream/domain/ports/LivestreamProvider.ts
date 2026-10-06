import type { LivestreamDiscovery } from "../Livestream.ts";

export interface LivestreamProvider {
  findLivestream(): Promise<LivestreamDiscovery | null>;
}
