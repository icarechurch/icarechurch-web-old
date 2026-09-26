import { GetAnalyticsOverview } from "../application/GetAnalyticsOverview.ts";
import { GetAnalyticsSummary } from "../application/GetAnalyticsSummary.ts";
import { GetContentAnalytics } from "../application/GetContentAnalytics.ts";
import { ListDailyVisits } from "../application/ListDailyVisits.ts";
import { ListPagePopularity } from "../application/ListPagePopularity.ts";
import { ListRecentVisits } from "../application/ListRecentVisits.ts";
import { TrackAnalyticsVisit } from "../application/TrackAnalyticsVisit.ts";
import type {
  AnalyticsOverview,
  AnalyticsOverviewInput,
} from "../domain/ports/AnalyticsRepository.ts";

export class AnalyticsController {
  constructor(
    private readonly trackVisitUseCase: TrackAnalyticsVisit,
    private readonly summaryUseCase: GetAnalyticsSummary,
    private readonly dailyVisitsUseCase: ListDailyVisits,
    private readonly pagePopularityUseCase: ListPagePopularity,
    private readonly recentVisitsUseCase: ListRecentVisits,
    private readonly contentUseCase: GetContentAnalytics,
    private readonly overviewUseCase: GetAnalyticsOverview,
  ) {}

  trackVisit(payload: unknown): Promise<null> {
    return this.trackVisitUseCase.execute(payload);
  }

  summary(input: { daysBack: unknown }): Promise<unknown> {
    return this.summaryUseCase.execute(input);
  }

  dailyVisits(input: { daysBack: unknown }): Promise<unknown> {
    return this.dailyVisitsUseCase.execute(input);
  }

  pagePopularity(input: { daysBack: unknown }): Promise<unknown> {
    return this.pagePopularityUseCase.execute(input);
  }

  recentVisits(input: { limit: unknown }): Promise<unknown> {
    return this.recentVisitsUseCase.execute(input);
  }

  content(): Promise<unknown> {
    return this.contentUseCase.execute();
  }

  overview(input: AnalyticsOverviewInput): Promise<AnalyticsOverview> {
    return this.overviewUseCase.execute(input);
  }
}
