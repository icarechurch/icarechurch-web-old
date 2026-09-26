import type { ActivityLogRepository } from "../domain/ports/ActivityLogRepository.ts";

export class ListActivityLogEntityTypes {
  constructor(private readonly repository: ActivityLogRepository) {}

  execute(): Promise<unknown> {
    return this.repository.entityTypes();
  }
}
