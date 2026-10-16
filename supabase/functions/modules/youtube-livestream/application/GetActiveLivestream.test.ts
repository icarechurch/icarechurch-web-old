import {
  GetActiveLivestream,
  LivestreamProviderError,
} from "./GetActiveLivestream.ts";
import type { LivestreamCacheRepository } from "../domain/ports/LivestreamCacheRepository.ts";
import type { LivestreamProvider } from "../domain/ports/LivestreamProvider.ts";
import type { CacheStatus, LivestreamDiscovery } from "../domain/Livestream.ts";

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
  cacheStatus?: CacheStatus;
  provider?: LivestreamDiscovery | null;
  providerError?: Error;
  now?: () => Date;
} = {}) => {
  const calls: string[] = [];
  const cache: LivestreamCacheRepository = {
    async readStatus() {
      calls.push("readStatus");
      return options.cacheStatus ?? staleStatus;
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
    async savePast() {
      calls.push("savePast");
    },
  };
  const provider: LivestreamProvider = {
    async findLivestream() {
      calls.push("findLivestream");
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

Deno.test("returns a fresh cached past stream on a weekday", async () => {
  const { calls, useCase } = createDependencies({
    cacheStatus: {
      ...staleStatus,
      video_id: "past-video",
      video_title: "Last Sunday service",
      provider_attempted_at: "2026-01-04T23:55:00.000Z",
    },
    now: () => new Date("2026-01-05T00:00:00.000Z"),
  });
  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({
        status: "past",
        video: { id: "past-video", title: "Last Sunday service" },
        checkedAt: "2026-01-04T23:55:00.000Z",
      })
  ) {
    throw new Error("Expected the cached past stream outside the window");
  }
  if (calls.join(",") !== "readStatus") {
    throw new Error(`Unexpected calls: ${calls.join(",")}`);
  }
});

Deno.test("refreshes on a weekday when no current or past stream exists", async () => {
  const { calls, useCase } = createDependencies({
    now: () => new Date("2026-01-05T00:00:00.000Z"),
  });
  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({
        status: "offline",
        checkedAt: "2026-01-05T00:00:00.000Z",
      })
  ) {
    throw new Error("Expected offline when YouTube has no eligible stream");
  }
  if (
    calls.join(",") !==
      "readStatus,claimRefresh,findLivestream,saveOffline"
  ) {
    throw new Error(`Unexpected calls: ${calls.join(",")}`);
  }
});

Deno.test("returns and persists a claimed live result", async () => {
  const { calls, useCase } = createDependencies({
    now: () => new Date("2026-10-10T01:53:00.000Z"),
    provider: {
      kind: "live",
      video: { id: "live-video", title: "Sunday service" },
    },
  });

  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({
        status: "live",
        video: { id: "live-video", title: "Sunday service" },
        checkedAt: "2026-10-10T01:53:00.000Z",
      })
  ) {
    throw new Error("Expected the live provider result");
  }
  if (
    calls.join(",") !== "readStatus,claimRefresh,findLivestream,saveLive"
  ) {
    throw new Error(`Unexpected calls: ${calls.join(",")}`);
  }
});

Deno.test("returns and persists the newest past result", async () => {
  const { calls, useCase } = createDependencies({
    provider: {
      kind: "past",
      video: { id: "past-video", title: "Last Sunday service" },
    },
  });

  const result = await useCase.execute();

  if (
    JSON.stringify(result) !==
      JSON.stringify({
        status: "past",
        video: { id: "past-video", title: "Last Sunday service" },
        checkedAt: NOW.toISOString(),
      })
  ) {
    throw new Error("Expected the past provider result");
  }
  if (
    calls.join(",") !== "readStatus,claimRefresh,findLivestream,savePast"
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
        "readStatus,claimRefresh,findLivestream,saveOffline"
    ) {
      throw new Error(`Unexpected failure calls: ${calls.join(",")}`);
    }
    return;
  }

  throw new Error("Expected the provider failure to reject");
});
