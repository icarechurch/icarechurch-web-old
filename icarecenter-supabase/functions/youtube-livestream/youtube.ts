import type { LiveStream } from "./types.ts";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const PROVIDER_TIMEOUT_MS = 30_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

export const findActivePublicLivestream = async (): Promise<LiveStream | null> => {
  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    const channelId = Deno.env.get("YOUTUBE_CHANNEL_ID");

    if (!apiKey || !channelId) {
      throw new Error("YouTube provider configuration is missing");
    }

    const searchParams = new URLSearchParams({
      channelId,
      eventType: "live",
      key: apiKey,
      maxResults: "1",
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      videoSyndicated: "true",
    });
    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`, {
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`YouTube provider returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.items)) {
      throw new Error("YouTube provider response is malformed");
    }

    if (payload.items.length === 0) {
      return null;
    }

    const firstItem: unknown = payload.items[0];
    if (!isRecord(firstItem)) {
      throw new Error("YouTube provider result is malformed");
    }

    const itemId = isRecord(firstItem.id) ? firstItem.id.videoId : null;
    const snippet = isRecord(firstItem.snippet) ? firstItem.snippet : null;
    const videoId = getString(itemId);
    const title = getString(snippet?.title);

    if (!videoId || !title) {
      throw new Error("YouTube provider result is incomplete");
    }

    return { id: videoId, title };
  } catch {
    throw new Error("YouTube livestream lookup failed");
  }
};
