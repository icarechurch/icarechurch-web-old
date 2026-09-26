import {
  isEligibleCheckingWindow,
  isFreshAttempt,
} from "../domain/LivestreamSchedule.ts";
import type {
  CacheStatus,
  LiveStream,
  LivestreamResponse,
} from "../domain/Livestream.ts";
import type { LivestreamCacheRepository } from "../domain/ports/LivestreamCacheRepository.ts";
import type { LivestreamProvider } from "../domain/ports/LivestreamProvider.ts";

export type GetActiveLivestreamDependencies = {
  cache: LivestreamCacheRepository;
  provider: LivestreamProvider;
  now: () => Date;
};

export class LivestreamProviderError extends Error {
  constructor() {
    super("YouTube livestream lookup failed");
    this.name = "LivestreamProviderError";
  }
}

const offlineResponse = (checkedAt: string | null): LivestreamResponse => ({
  status: "offline",
  checkedAt,
});

const responseFromCache = (status: CacheStatus): LivestreamResponse => {
  if (status.status === "live" && status.video_id && status.video_title) {
    return {
      status: "live",
      video: { id: status.video_id, title: status.video_title },
      checkedAt: status.provider_attempted_at ?? new Date(0).toISOString(),
    };
  }

  return offlineResponse(status.provider_attempted_at);
};

export class GetActiveLivestream {
  constructor(private readonly dependencies: GetActiveLivestreamDependencies) {}

  async execute(): Promise<LivestreamResponse> {
    const now = this.dependencies.now();
    if (!isEligibleCheckingWindow(now)) {
      return offlineResponse(null);
    }

    const cachedStatus = await this.dependencies.cache.readStatus();
    if (isFreshAttempt(cachedStatus.provider_attempted_at, now)) {
      return responseFromCache(cachedStatus);
    }

    const claimed = await this.dependencies.cache.claimRefresh(now);
    if (!claimed) {
      return offlineResponse(cachedStatus.provider_attempted_at);
    }

    try {
      const activeLivestream = await this.dependencies.provider
        .findActiveLivestream();
      if (!activeLivestream) {
        await this.dependencies.cache.saveOffline();
        return offlineResponse(now.toISOString());
      }

      await this.dependencies.cache.saveLive(activeLivestream);
      return {
        status: "live",
        video: activeLivestream,
        checkedAt: now.toISOString(),
      };
    } catch {
      try {
        await this.dependencies.cache.saveOffline();
      } catch {
        // Preserve the sanitized provider failure even if cache cleanup fails.
      }
      throw new LivestreamProviderError();
    }
  }
}
