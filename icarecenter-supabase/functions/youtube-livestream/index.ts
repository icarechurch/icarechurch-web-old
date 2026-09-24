import { createOptionsResponse } from "../_shared/cors.ts";
import { HttpError } from "../_shared/errors.ts";
import { parseRequest } from "../_shared/request.ts";
import { failFromError, ok } from "../_shared/responses.ts";
import { createServiceRoleCacheRepository } from "./cache.ts";
import { isEligibleCheckingWindow, isFreshAttempt } from "./schedule.ts";
import type { CacheRepository } from "./cache.ts";
import type { CacheStatus, LiveStream, LivestreamResponse } from "./types.ts";
import { findActivePublicLivestream } from "./youtube.ts";

const YOUTUBE_LOOKUP_ERROR = new HttpError(
  502,
  "YOUTUBE_LOOKUP_FAILED",
  "Unable to check for a live stream",
);

export type LivestreamDependencies = {
  cache: CacheRepository;
  findActiveLivestream: () => Promise<LiveStream | null>;
  now: () => Date;
};

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

const isLivestreamRequest = (resource: string, operation: string): boolean =>
  resource === "livestream" && operation === "get-active";

export const createLivestreamHandler =
  (dependencies: LivestreamDependencies) =>
  async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return createOptionsResponse();
    }

    try {
      const request = await parseRequest(req);
      if (!isLivestreamRequest(request.resource, request.operation)) {
        throw new HttpError(
          400,
          "INVALID_OPERATION",
          `Unsupported livestream operation: ${request.resource}/${request.operation}`,
        );
      }

      const now = dependencies.now();
      if (!isEligibleCheckingWindow(now)) {
        return ok(offlineResponse(null));
      }

      const cachedStatus = await dependencies.cache.readStatus();
      if (isFreshAttempt(cachedStatus.provider_attempted_at, now)) {
        return ok(responseFromCache(cachedStatus));
      }

      const claimed = await dependencies.cache.claimRefresh(now);
      if (!claimed) {
        return ok(offlineResponse(cachedStatus.provider_attempted_at));
      }

      try {
        const activeLivestream = await dependencies.findActiveLivestream();
        if (!activeLivestream) {
          await dependencies.cache.saveOffline();
          return ok(offlineResponse(now.toISOString()));
        }

        await dependencies.cache.saveLive(activeLivestream);
        return ok({
          status: "live",
          video: activeLivestream,
          checkedAt: now.toISOString(),
        } satisfies LivestreamResponse);
      } catch {
        try {
          await dependencies.cache.saveOffline();
        } catch {
          // Preserve the sanitized provider failure even if cache cleanup fails.
        }
        throw YOUTUBE_LOOKUP_ERROR;
      }
    } catch (error) {
      return failFromError(error);
    }
  };

export const handleLivestreamRequest = async (req: Request): Promise<Response> =>
  createLivestreamHandler({
    cache: createServiceRoleCacheRepository(),
    findActiveLivestream: findActivePublicLivestream,
    now: () => new Date(),
  })(req);

if (import.meta.main) {
  Deno.serve(handleLivestreamRequest);
}
