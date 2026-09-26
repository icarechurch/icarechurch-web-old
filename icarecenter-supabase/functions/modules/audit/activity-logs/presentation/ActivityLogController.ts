import { ClearActivityLogs } from "../application/ClearActivityLogs.ts";
import { CreateActivityLog } from "../application/CreateActivityLog.ts";
import { GetActivityLogSummary } from "../application/GetActivityLogSummary.ts";
import { ListActivityLogActionTypes } from "../application/ListActivityLogActionTypes.ts";
import { ListActivityLogEntityTypes } from "../application/ListActivityLogEntityTypes.ts";
import { ListActivityLogs } from "../application/ListActivityLogs.ts";
import type { ActivityLogListInput } from "../domain/ports/ActivityLogRepository.ts";

export class ActivityLogController {
  constructor(
    private readonly listLogs: ListActivityLogs,
    private readonly summaryLogs: GetActivityLogSummary,
    private readonly clearLogs: ClearActivityLogs,
    private readonly createLog: CreateActivityLog,
    private readonly actionTypes: ListActivityLogActionTypes,
    private readonly entityTypes: ListActivityLogEntityTypes,
  ) {}

  list(input: ActivityLogListInput): Promise<unknown> {
    return this.listLogs.execute(input);
  }

  summary(): Promise<unknown> {
    return this.summaryLogs.execute();
  }

  clear(): Promise<null> {
    return this.clearLogs.execute();
  }

  create(input: unknown): Promise<null> {
    return this.createLog.execute(input);
  }

  actionTypesList(): Promise<unknown> {
    return this.actionTypes.execute();
  }

  entityTypesList(): Promise<unknown> {
    return this.entityTypes.execute();
  }
}
