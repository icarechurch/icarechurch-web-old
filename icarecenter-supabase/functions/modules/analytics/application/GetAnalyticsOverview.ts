import type {
  AnalyticsOverview,
  AnalyticsOverviewInput,
  AnalyticsRepository,
} from "../domain/ports/AnalyticsRepository.ts";

export class GetAnalyticsOverview {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(input: AnalyticsOverviewInput = {}): Promise<AnalyticsOverview> {
    return this.repository.overview(input);
  }
}
