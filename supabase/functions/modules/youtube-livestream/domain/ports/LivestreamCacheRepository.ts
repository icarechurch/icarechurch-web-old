import type { CacheStatus, LiveStream } from "../Livestream.ts";

export interface LivestreamCacheRepository {
  readStatus(): Promise<CacheStatus>;
  claimRefresh(now: Date): Promise<boolean>;
  saveLive(stream: LiveStream): Promise<void>;
  savePast(stream: LiveStream): Promise<void>;
  saveOffline(): Promise<void>;
}
