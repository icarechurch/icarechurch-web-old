import { GetActiveLivestream } from "./application/GetActiveLivestream.ts";
import { createServiceRoleLivestreamCacheRepository } from "./infrastructure/SupabaseLivestreamCacheRepository.ts";
import { createYouTubeLivestreamProvider } from "./infrastructure/YouTubeLivestreamProvider.ts";
import { LivestreamController } from "./presentation/LivestreamController.ts";

export function createLivestreamModule(): LivestreamController {
  return new LivestreamController(
    new GetActiveLivestream({
      cache: createServiceRoleLivestreamCacheRepository(),
      now: () => new Date(),
      provider: createYouTubeLivestreamProvider(),
    }),
  );
}
