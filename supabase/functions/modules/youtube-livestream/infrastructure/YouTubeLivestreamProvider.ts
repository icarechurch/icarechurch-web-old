import type { LivestreamProvider } from "../domain/ports/LivestreamProvider.ts";
import type { LiveStream } from "../domain/Livestream.ts";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const UPLOADS_MAX_RESULTS = "25";
const PROVIDER_TIMEOUT_MS = 30_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const getRecord = (
  value: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null => {
  const nested = value?.[key];
  return isRecord(nested) ? nested : null;
};

const fetchYouTubeJson = async (
  url: string,
  signal: AbortSignal,
): Promise<unknown> => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`YouTube provider returned ${response.status}`);
  }

  return response.json();
};

const getItems = (payload: unknown): unknown[] => {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new Error("YouTube provider response is malformed");
  }

  return payload.items;
};

const getUploadsPlaylistId = (payload: unknown): string | null => {
  const [channel] = getItems(payload);
  if (channel === undefined) {
    return null;
  }

  if (!isRecord(channel)) {
    throw new Error("YouTube provider channel is malformed");
  }

  const contentDetails = getRecord(channel, "contentDetails");
  const relatedPlaylists = getRecord(contentDetails, "relatedPlaylists");
  const uploadsPlaylistId = getString(relatedPlaylists?.uploads);

  if (!uploadsPlaylistId) {
    throw new Error("YouTube provider uploads playlist is missing");
  }

  return uploadsPlaylistId;
};

const getVideoIds = (payload: unknown): string[] =>
  getItems(payload)
    .filter(isRecord)
    .map((item) => {
      const contentDetails = getRecord(item, "contentDetails");
      return getString(contentDetails?.videoId);
    })
    .filter((videoId): videoId is string => videoId !== null);

const getActiveLivestream = (payload: unknown): LiveStream | null => {
  for (const item of getItems(payload)) {
    if (!isRecord(item)) {
      continue;
    }

    const videoId = getString(item.id);
    const snippet = getRecord(item, "snippet");
    const liveStreamingDetails = getRecord(item, "liveStreamingDetails");
    const status = getRecord(item, "status");
    const title = getString(snippet?.title);
    const actualStartTime = getString(liveStreamingDetails?.actualStartTime);
    const actualEndTime = getString(liveStreamingDetails?.actualEndTime);

    if (
      videoId &&
      title &&
      actualStartTime &&
      !actualEndTime &&
      status?.privacyStatus === "public" &&
      status.embeddable === true
    ) {
      return { id: videoId, title };
    }
  }

  return null;
};

export const createYouTubeLivestreamProvider = (): LivestreamProvider => ({
  async findActiveLivestream(): Promise<LiveStream | null> {
    try {
      const apiKey = Deno.env.get("YOUTUBE_API_KEY");
      const channelId = Deno.env.get("YOUTUBE_CHANNEL_ID");

      if (!apiKey || !channelId) {
        throw new Error("YouTube provider configuration is missing");
      }

      const signal = AbortSignal.timeout(PROVIDER_TIMEOUT_MS);
      const channelParams = new URLSearchParams({
        id: channelId,
        key: apiKey,
        part: "contentDetails",
      });
      const channelPayload = await fetchYouTubeJson(
        `${YOUTUBE_API_BASE_URL}/channels?${channelParams}`,
        signal,
      );
      const uploadsPlaylistId = getUploadsPlaylistId(channelPayload);

      if (!uploadsPlaylistId) {
        return null;
      }

      const playlistParams = new URLSearchParams({
        key: apiKey,
        maxResults: UPLOADS_MAX_RESULTS,
        part: "contentDetails",
        playlistId: uploadsPlaylistId,
      });
      const playlistPayload = await fetchYouTubeJson(
        `${YOUTUBE_API_BASE_URL}/playlistItems?${playlistParams}`,
        signal,
      );
      const videoIds = getVideoIds(playlistPayload);

      if (videoIds.length === 0) {
        return null;
      }

      const videosParams = new URLSearchParams({
        id: videoIds.join(","),
        key: apiKey,
        part: "snippet,liveStreamingDetails,status",
      });
      const videosPayload = await fetchYouTubeJson(
        `${YOUTUBE_API_BASE_URL}/videos?${videosParams}`,
        signal,
      );

      return getActiveLivestream(videosPayload);
    } catch {
      throw new Error("YouTube livestream lookup failed");
    }
  },
});
