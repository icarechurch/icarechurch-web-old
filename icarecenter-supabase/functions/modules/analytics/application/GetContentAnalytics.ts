import type { AnalyticsRepository } from "../domain/ports/AnalyticsRepository.ts";

export class GetContentAnalytics {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(): Promise<unknown> {
    return this.repository.content();
  }
}
