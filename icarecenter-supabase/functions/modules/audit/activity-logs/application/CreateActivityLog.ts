import type { ActivityLogRepository } from "../domain/ports/ActivityLogRepository.ts";

export class CreateActivityLog {
  constructor(private readonly repository: ActivityLogRepository) {}

  execute(payload: unknown): Promise<null> {
    return this.repository.create(payload);
  }
}
