import {
  GetActiveLivestream,
  LivestreamProviderError,
} from "./GetActiveLivestream.ts";
import type { LivestreamCacheRepository } from "../domain/ports/LivestreamCacheRepository.ts";
import type { LivestreamProvider } from "../domain/ports/LivestreamProvider.ts";
import type { CacheStatus, LiveStream } from "../domain/Livestream.ts";

const NOW = new Date("2026-01-04T00:00:00.000Z");
const staleStatus: CacheStatus = {
  singleton_key: true,
  status: "offline",
  video_id: null,
  video_title: null,
  provider_attempted_at: "2026-01-03T23:00:00.000Z",
  refresh_lease_until: null,
};

const createDependencies = (options: {
  claim?: boolean;
  provider?: LiveStream | null;
  providerError?: Error;
  now?: () => Date;
} = {}) => {
  const calls: string[] = [];
  const cache: LivestreamCacheRepository = {
    async readStatus() {
      calls.push("readStatus");
      return staleStatus;
    },
    async claimRefresh() {
      calls.push("claimRefresh");
      return options.claim ?? true;
    },
    async saveLive() {
      calls.push("saveLive");
    },
    async saveOffline() {
      calls.push("saveOffline");
    },
  };
  const provider: LivestreamProvider = {
    async findActiveLivestream() {
      calls.push("findActiveLivestream");
      if (options.providerError) {
        throw options.providerError;
      }
      return options.provider ?? null;
    },
  };

  return {
    calls,
    useCase: new GetActiveLivestream({
      cache,
      now: options.now ?? (() => NOW),
      provider,
    }),
  };
};

Deno.test("returns offline outside the checking window without touching dependencies", async () => {
  const { calls, useCase } = createDependencies({
    now: () => new Date("2026-01-05T00:00:00.000Z"),
  });
  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({ status: "offline", checkedAt: null })
  ) {
    throw new Error("Expected offline outside the checking window");
  }
  if (calls.length !== 0) {
    throw new Error("Ineligible requests must not access dependencies");
  }
});

Deno.test("returns and persists a claimed live result", async () => {
  const { calls, useCase } = createDependencies({
    provider: { id: "live-video", title: "Sunday service" },
  });

  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({
        status: "live",
        video: { id: "live-video", title: "Sunday service" },
        checkedAt: NOW.toISOString(),
      })
  ) {
    throw new Error("Expected the live provider result");
  }
  if (
    calls.join(",") !== "readStatus,claimRefresh,findActiveLivestream,saveLive"
  ) {
    throw new Error(`Unexpected calls: ${calls.join(",")}`);
  }
});

Deno.test("sanitizes provider failures after releasing the cache lease", async () => {
  const { calls, useCase } = createDependencies({
    providerError: new Error("secret provider failure"),
  });

  try {
    await useCase.execute();
  } catch (error) {
    if (!(error instanceof LivestreamProviderError)) {
      throw new Error("Expected a sanitized provider error");
    }
    if (
      calls.join(",") !==
        "readStatus,claimRefresh,findActiveLivestream,saveOffline"
    ) {
      throw new Error(`Unexpected failure calls: ${calls.join(",")}`);
    }
    return;
  }

  throw new Error("Expected the provider failure to reject");
});
