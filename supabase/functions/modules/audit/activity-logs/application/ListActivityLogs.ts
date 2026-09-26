import type {
  ActivityLogListInput,
  ActivityLogRepository,
} from "../domain/ports/ActivityLogRepository.ts";

export class ListActivityLogs {
  constructor(private readonly repository: ActivityLogRepository) {}

  execute(input: ActivityLogListInput): Promise<unknown> {
    return this.repository.list(input);
  }
}
