import type { LiveStream } from "../Livestream.ts";

export interface LivestreamProvider {
  findActiveLivestream(): Promise<LiveStream | null>;
}
