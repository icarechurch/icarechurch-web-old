import type { ActivityLogRepository } from "../domain/ports/ActivityLogRepository.ts";

export class ClearActivityLogs {
  constructor(private readonly repository: ActivityLogRepository) {}

  execute(): Promise<null> {
    return this.repository.clear();
  }
}
