import type { AnalyticsRepository } from "../domain/ports/AnalyticsRepository.ts";

export class ListRecentVisits {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(input: { limit: unknown }): Promise<unknown> {
    return this.repository.recentVisits(input);
  }
}
