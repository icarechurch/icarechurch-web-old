import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GetAnalyticsOverview } from "./application/GetAnalyticsOverview.ts";
import { GetAnalyticsSummary } from "./application/GetAnalyticsSummary.ts";
import { GetContentAnalytics } from "./application/GetContentAnalytics.ts";
import { ListDailyVisits } from "./application/ListDailyVisits.ts";
import { ListPagePopularity } from "./application/ListPagePopularity.ts";
import { ListRecentVisits } from "./application/ListRecentVisits.ts";
import { TrackAnalyticsVisit } from "./application/TrackAnalyticsVisit.ts";
import { AnalyticsController } from "./presentation/AnalyticsController.ts";
import { SupabaseAnalyticsRepository } from "./infrastructure/SupabaseAnalyticsRepository.ts";

export type AnalyticsHandler = (input?: unknown) => Promise<unknown>;
export type AnalyticsRoutes = Record<string, AnalyticsHandler>;

export function createAnalyticsModule(client: SupabaseClient): AnalyticsRoutes {
  const repository = new SupabaseAnalyticsRepository(client);
  const controller = new AnalyticsController(
    new TrackAnalyticsVisit(repository),
    new GetAnalyticsSummary(repository),
    new ListDailyVisits(repository),
    new ListPagePopularity(repository),
    new ListRecentVisits(repository),
    new GetContentAnalytics(repository),
    new GetAnalyticsOverview(repository),
  );

  return {
    "track-visit": (input) => controller.trackVisit(input),
    summary: (input) => controller.summary(input as { daysBack: unknown }),
    "daily-visits": (input) =>
      controller.dailyVisits(input as { daysBack: unknown }),
    "page-popularity": (input) =>
      controller.pagePopularity(input as { daysBack: unknown }),
    "recent-visits": (input) =>
      controller.recentVisits(input as { limit: unknown }),
    content: () => controller.content(),
    overview: (input) => controller.overview(input as never),
  };
}
