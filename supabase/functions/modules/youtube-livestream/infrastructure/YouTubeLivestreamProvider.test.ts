import { createYouTubeLivestreamProvider } from "./YouTubeLivestreamProvider.ts";

const setProviderConfig = () => {
  Deno.env.set("YOUTUBE_API_KEY", "test-api-key");
  Deno.env.set("YOUTUBE_CHANNEL_ID", "channel-123");
};

const expectRejected = async (operation: () => Promise<unknown>) => {
  try {
    await operation();
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("lookup")) {
      throw new Error("Expected a non-secret livestream lookup error");
    }
    return;
  }

  throw new Error("Expected the operation to reject");
};

Deno.test("finds an active embeddable video from the channel uploads playlist", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  const requestUrls: string[] = [];
  let requestSignal: AbortSignal | null | undefined;

  globalThis.fetch = async (input, init) => {
    const requestUrl = input.toString();
    requestUrls.push(requestUrl);
    requestSignal = init?.signal;

    switch (new URL(requestUrl).pathname) {
      case "/youtube/v3/channels":
        return new Response(
          JSON.stringify({
            items: [
              {
                contentDetails: {
                  relatedPlaylists: { uploads: "uploads-123" },
                },
              },
            ],
          }),
          { status: 200 },
        );
      case "/youtube/v3/playlistItems":
        return new Response(
          JSON.stringify({
            items: [
              { contentDetails: { videoId: "video-123" } },
              { contentDetails: { videoId: "video-archive" } },
            ],
          }),
          { status: 200 },
        );
      case "/youtube/v3/videos":
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "video-archive",
                snippet: { title: "Last Sunday service" },
                liveStreamingDetails: {
                  actualStartTime: "2026-01-04T02:00:00Z",
                  actualEndTime: "2026-01-04T04:00:00Z",
                },
                status: { embeddable: true, privacyStatus: "public" },
              },
              {
                id: "video-123",
                snippet: { title: "Sunday service" },
                liveStreamingDetails: {
                  actualStartTime: "2026-01-11T02:00:00Z",
                },
                status: { embeddable: true, privacyStatus: "public" },
              },
            ],
          }),
          { status: 200 },
        );
      default:
        return new Response(null, { status: 404 });
    }
  };

  try {
    const stream = await createYouTubeLivestreamProvider()
      .findActiveLivestream();
    const [channelRequest, playlistRequest, videosRequest] = requestUrls.map(
      (requestUrl) => new URL(requestUrl),
    );

    if (
      stream?.id !== "video-123" ||
      stream.title !== "Sunday service" ||
      requestUrls.length !== 3 ||
      channelRequest.searchParams.get("part") !== "contentDetails" ||
      channelRequest.searchParams.get("id") !== "channel-123" ||
      playlistRequest.searchParams.get("part") !== "contentDetails" ||
      playlistRequest.searchParams.get("playlistId") !== "uploads-123" ||
      playlistRequest.searchParams.get("maxResults") !== "25" ||
      videosRequest.searchParams.get("part") !==
        "snippet,liveStreamingDetails,status" ||
      videosRequest.searchParams.get("id") !== "video-123,video-archive" ||
      channelRequest.searchParams.get("key") !== "test-api-key" ||
      !requestSignal ||
      requestSignal.aborted
    ) {
      throw new Error("Expected the YouTube uploads playlist lookup");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("returns offline when the uploads playlist has no active video", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    switch (new URL(input.toString()).pathname) {
      case "/youtube/v3/channels":
        return new Response(
          JSON.stringify({
            items: [
              {
                contentDetails: {
                  relatedPlaylists: { uploads: "uploads-123" },
                },
              },
            ],
          }),
          { status: 200 },
        );
      case "/youtube/v3/playlistItems":
        return new Response(
          JSON.stringify({
            items: [{ contentDetails: { videoId: "video-archive" } }],
          }),
          { status: 200 },
        );
      default:
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "video-archive",
                snippet: { title: "Last Sunday service" },
                liveStreamingDetails: {
                  actualStartTime: "2026-01-04T02:00:00Z",
                  actualEndTime: "2026-01-04T04:00:00Z",
                },
                status: { embeddable: true, privacyStatus: "public" },
              },
            ],
          }),
          { status: 200 },
        );
    }
  };

  try {
    if (
      (await createYouTubeLivestreamProvider().findActiveLivestream()) !== null
    ) {
      throw new Error("Expected an empty result to be offline");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("rejects malformed first results", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        items: [{ contentDetails: { relatedPlaylists: {} } }],
      }),
      { status: 200 },
    );

  try {
    await expectRejected(() =>
      createYouTubeLivestreamProvider().findActiveLivestream()
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("rejects non-OK provider responses", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ error: { message: "secret provider detail" } }),
      {
        status: 503,
      },
    );

  try {
    await expectRejected(() =>
      createYouTubeLivestreamProvider().findActiveLivestream()
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("passes a 30-second abort signal to the provider", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  const originalTimeout = AbortSignal.timeout;
  let timeoutMilliseconds = 0;

  AbortSignal.timeout = (milliseconds) => {
    timeoutMilliseconds = milliseconds;
    return new AbortController().signal;
  };
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ items: [] }), { status: 200 });

  try {
    await createYouTubeLivestreamProvider().findActiveLivestream();
    if (timeoutMilliseconds !== 30_000) {
      throw new Error("Expected a 30-second provider timeout");
    }
  } finally {
    AbortSignal.timeout = originalTimeout;
    globalThis.fetch = originalFetch;
  }
});
