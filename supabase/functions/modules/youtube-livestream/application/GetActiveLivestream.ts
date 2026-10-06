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

const responseFromCache = (
  status: CacheStatus,
  treatLiveAsPast = false,
): LivestreamResponse => {
  if (
    status.video_id && status.video_title &&
    (status.status === "offline" || treatLiveAsPast)
  ) {
    return {
      status: "past",
      video: { id: status.video_id, title: status.video_title },
      checkedAt: status.provider_attempted_at ?? new Date(0).toISOString(),
    };
  }

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
    const cachedStatus = await this.dependencies.cache.readStatus();

    if (!isEligibleCheckingWindow(now)) {
      return responseFromCache(cachedStatus, true);
    }

    if (isFreshAttempt(cachedStatus.provider_attempted_at, now)) {
      return responseFromCache(cachedStatus);
    }

    const claimed = await this.dependencies.cache.claimRefresh(now);
    if (!claimed) {
      return offlineResponse(cachedStatus.provider_attempted_at);
    }

    try {
      const discovery = await this.dependencies.provider.findLivestream();
      if (!discovery) {
        await this.dependencies.cache.saveOffline();
        return offlineResponse(now.toISOString());
      }

      if (discovery.kind === "past") {
        await this.dependencies.cache.savePast(discovery.video);
        return {
          status: "past",
          video: discovery.video,
          checkedAt: now.toISOString(),
        };
      }

      await this.dependencies.cache.saveLive(discovery.video);
      return {
        status: "live",
        video: discovery.video,
        checkedAt: now.toISOString(),
      };
    } catch {
      try {
        if (cachedStatus.video_id && cachedStatus.video_title) {
          await this.dependencies.cache.savePast({
            id: cachedStatus.video_id,
            title: cachedStatus.video_title,
          });
        } else {
          await this.dependencies.cache.saveOffline();
        }
      } catch {
        // Preserve the sanitized provider failure even if cache cleanup fails.
      }
      throw new LivestreamProviderError();
    }
  }
}
