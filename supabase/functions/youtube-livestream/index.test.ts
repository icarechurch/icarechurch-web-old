import {
  createLivestreamHandler,
  type LivestreamDependencies,
} from "./index.ts";
import type { CacheRepository } from "./cache.ts";
import type { CacheStatus, LiveStream } from "./types.ts";

const NOW = new Date("2026-01-04T00:00:00.000Z");
const staleStatus: CacheStatus = {
  singleton_key: true,
  status: "offline",
  video_id: null,
  video_title: null,
  provider_attempted_at: "2026-01-03T23:00:00.000Z",
  refresh_lease_until: null,
};

const liveStatus: CacheStatus = {
  ...staleStatus,
  status: "live",
  video_id: "cached-video",
  video_title: "Cached Sunday service",
  provider_attempted_at: "2026-01-03T23:59:00.000Z",
};

const createDependencies = (options: {
  status?: CacheStatus;
  claim?: boolean;
  provider?: LiveStream | null;
  providerError?: Error;
  now?: () => Date;
} = {}) => {
  const calls: string[] = [];
  const cache: CacheRepository = {
    async readStatus() {
      calls.push("readStatus");
      return options.status ?? staleStatus;
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

  const dependencies: LivestreamDependencies = {
    cache,
    findActiveLivestream: async () => {
      calls.push("findActiveLivestream");
      if (options.providerError) {
        throw options.providerError;
      }
      return options.provider ?? null;
    },
    now: options.now ?? (() => NOW),
  };

  return { calls, handler: createLivestreamHandler(dependencies) };
};

const request = (body: unknown) =>
  new Request("https://example.com/functions/v1/youtube-livestream", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

const readResponse = async (response: Response) =>
  (await response.json()) as {
    data?: Record<string, unknown>;
    error?: { code: string; message: string };
  };

const assertSuccess = (
  responseBody: Awaited<ReturnType<typeof readResponse>>,
  expected: Record<string, unknown>,
) => {
  if (JSON.stringify(responseBody.data) !== JSON.stringify(expected)) {
    throw new Error(`Unexpected success body: ${JSON.stringify(responseBody)}`);
  }
};

Deno.test("returns CORS preflight without invoking dependencies", async () => {
  const { handler, calls } = createDependencies();
  const response = await handler(
    new Request("https://example.com", { method: "OPTIONS" }),
  );

  if (response.status !== 204 || calls.length !== 0) {
    throw new Error("Expected an empty OPTIONS response");
  }
});

Deno.test("rejects invalid requests and unsupported operations", async () => {
  const invalid = createDependencies();
  const invalidResponse = await invalid.handler(
    new Request("https://example.com", {
      body: "not-json",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );
  const invalidBody = await readResponse(invalidResponse);

  if (invalidResponse.status !== 400 || invalidBody.error?.code !== "INVALID_REQUEST") {
    throw new Error("Expected invalid request rejection");
  }

  const unsupported = createDependencies();
  const unsupportedResponse = await unsupported.handler(
    request({ resource: "sermons", operation: "list" }),
  );
  const unsupportedBody = await readResponse(unsupportedResponse);

  if (
    unsupportedResponse.status !== 400 ||
    unsupportedBody.error?.code !== "INVALID_OPERATION"
  ) {
    throw new Error("Expected unsupported operation rejection");
  }
});

Deno.test("returns offline outside the eligible window without cache or provider access", async () => {
  const { handler, calls } = createDependencies({
    now: () => new Date("2026-01-05T00:00:00.000Z"),
  });
  const response = await handler(
    request({ resource: "livestream", operation: "get-active" }),
  );
  const body = await readResponse(response);

  assertSuccess(body, { status: "offline", checkedAt: null });
  if (calls.length !== 0) {
    throw new Error("Ineligible requests must not access the cache");
  }
});

Deno.test("returns a fresh cached live result", async () => {
  const freshStatus = { ...liveStatus, provider_attempted_at: "2026-01-03T23:59:00.000Z" };
  const { handler, calls } = createDependencies({ status: freshStatus });
  const response = await handler(
    request({ resource: "livestream", operation: "get-active" }),
  );
  const body = await readResponse(response);

  assertSuccess(body, {
    status: "live",
    video: { id: "cached-video", title: "Cached Sunday service" },
    checkedAt: freshStatus.provider_attempted_at,
  });
  if (calls.join(",") !== "readStatus") {
    throw new Error(`Unexpected fresh-cache calls: ${calls.join(",")}`);
  }
});

Deno.test("returns offline when another visitor owns the refresh claim", async () => {
  const { handler, calls } = createDependencies({ claim: false });
  const response = await handler(
    request({ resource: "livestream", operation: "get-active" }),
  );
  const body = await readResponse(response);

  assertSuccess(body, { status: "offline", checkedAt: staleStatus.provider_attempted_at });
  if (calls.join(",") !== "readStatus,claimRefresh") {
    throw new Error(`Unexpected unclaimed calls: ${calls.join(",")}`);
  }
});

Deno.test("returns and saves a claimed live result", async () => {
  const { handler, calls } = createDependencies({
    provider: { id: "live-video", title: "Live Sunday service" },
  });
  const response = await handler(
    request({ resource: "livestream", operation: "get-active" }),
  );
  const body = await readResponse(response);

  assertSuccess(body, {
    status: "live",
    video: { id: "live-video", title: "Live Sunday service" },
    checkedAt: NOW.toISOString(),
  });
  if (calls.join(",") !== "readStatus,claimRefresh,findActiveLivestream,saveLive") {
    throw new Error(`Unexpected claimed-live calls: ${calls.join(",")}`);
  }
});

Deno.test("returns and saves claimed no-result offline", async () => {
  const { handler, calls } = createDependencies({ provider: null });
  const response = await handler(
    request({ resource: "livestream", operation: "get-active" }),
  );
  const body = await readResponse(response);

  assertSuccess(body, { status: "offline", checkedAt: NOW.toISOString() });
  if (calls.join(",") !== "readStatus,claimRefresh,findActiveLivestream,saveOffline") {
    throw new Error(`Unexpected claimed-offline calls: ${calls.join(",")}`);
  }
});

Deno.test("sanitizes configuration, malformed, timeout, and network provider failures", async () => {
  for (const failure of [
    "missing configuration",
    "malformed provider response",
    "timeout",
    "provider network error",
  ]) {
    const { handler, calls } = createDependencies({
      providerError: new Error(`${failure}: secret provider details`),
    });
    const response = await handler(
      request({ resource: "livestream", operation: "get-active" }),
    );
    const body = await readResponse(response);

    if (
      response.status !== 502 ||
      JSON.stringify(body) !==
        JSON.stringify({
          error: {
            code: "YOUTUBE_LOOKUP_FAILED",
            message: "Unable to check for a live stream",
          },
        }) ||
      calls.join(",") !== "readStatus,claimRefresh,findActiveLivestream,saveOffline"
    ) {
      throw new Error(`Unexpected sanitized failure for ${failure}`);
    }
  }
});
