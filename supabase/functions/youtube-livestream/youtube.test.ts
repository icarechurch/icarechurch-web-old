import { findActivePublicLivestream } from "./youtube.ts";

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

Deno.test("findActivePublicLivestream sends the public live-video filters", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestSignal: AbortSignal | null | undefined;

  globalThis.fetch = async (input, init) => {
    requestUrl = input.toString();
    requestSignal = init?.signal;
    return new Response(
      JSON.stringify({
        items: [
          {
            id: { videoId: "video-123" },
            snippet: { title: "Sunday service" },
          },
        ],
      }),
      { status: 200 },
    );
  };

  try {
    const stream = await findActivePublicLivestream();
    const params = new URL(requestUrl).searchParams;

    if (
      stream?.id !== "video-123" ||
      stream.title !== "Sunday service" ||
      params.get("part") !== "snippet" ||
      params.get("channelId") !== "channel-123" ||
      params.get("eventType") !== "live" ||
      params.get("type") !== "video" ||
      params.get("videoEmbeddable") !== "true" ||
      params.get("videoSyndicated") !== "true" ||
      params.get("maxResults") !== "1" ||
      params.get("key") !== "test-api-key" ||
      !requestSignal ||
      requestSignal.aborted
    ) {
      throw new Error("Expected the bounded YouTube live search request");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("returns offline when YouTube has no live result", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ items: [] }), { status: 200 });

  try {
    if ((await findActivePublicLivestream()) !== null) {
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
      JSON.stringify({ items: [{ id: { videoId: "video-123" }, snippet: {} }] }),
      { status: 200 },
    );

  try {
    await expectRejected(() => findActivePublicLivestream());
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("rejects non-OK provider responses", async () => {
  setProviderConfig();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { message: "secret provider detail" } }), {
      status: 503,
    });

  try {
    await expectRejected(() => findActivePublicLivestream());
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
    await findActivePublicLivestream();
    if (timeoutMilliseconds !== 30_000) {
      throw new Error("Expected a 30-second provider timeout");
    }
  } finally {
    AbortSignal.timeout = originalTimeout;
    globalThis.fetch = originalFetch;
  }
});
