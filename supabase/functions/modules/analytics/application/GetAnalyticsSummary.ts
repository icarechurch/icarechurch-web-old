import type { AnalyticsRepository } from "../domain/ports/AnalyticsRepository.ts";

export class GetAnalyticsSummary {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(input: { daysBack: unknown }): Promise<unknown> {
    return this.repository.summary(input);
  }
}
