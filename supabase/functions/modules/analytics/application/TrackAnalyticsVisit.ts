import type { AnalyticsRepository } from "../domain/ports/AnalyticsRepository.ts";

export class TrackAnalyticsVisit {
  constructor(private readonly repository: AnalyticsRepository) {}

  execute(payload: unknown): Promise<null> {
    return this.repository.trackVisit(payload);
  }
}
