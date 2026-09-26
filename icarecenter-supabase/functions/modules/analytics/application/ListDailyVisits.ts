import type { AnalyticsRepository } from "../domain/ports/AnalyticsRepository.ts";

export class ListDailyVisits {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(input: { daysBack: unknown }): Promise<unknown> {
    return this.repository.dailyVisits(input);
  }
}
