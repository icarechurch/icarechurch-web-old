import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { ClearActivityLogs } from "./activity-logs/application/ClearActivityLogs.ts";
import { CreateActivityLog } from "./activity-logs/application/CreateActivityLog.ts";
import { GetActivityLogSummary } from "./activity-logs/application/GetActivityLogSummary.ts";
import { ListActivityLogActionTypes } from "./activity-logs/application/ListActivityLogActionTypes.ts";
import { ListActivityLogEntityTypes } from "./activity-logs/application/ListActivityLogEntityTypes.ts";
import { ListActivityLogs } from "./activity-logs/application/ListActivityLogs.ts";
import { SupabaseActivityLogRepository } from "./activity-logs/infrastructure/SupabaseActivityLogRepository.ts";
import { ActivityLogController } from "./activity-logs/presentation/ActivityLogController.ts";

export type AuditHandler = (input: unknown) => Promise<unknown>;
export type AuditRoutes = Record<string, AuditHandler>;

export function createAuditModule(client: SupabaseClient): {
  activityLogs: AuditRoutes;
} {
  const repository = new SupabaseActivityLogRepository(client);
  const controller = new ActivityLogController(
    new ListActivityLogs(repository),
    new GetActivityLogSummary(repository),
    new ClearActivityLogs(repository),
    new CreateActivityLog(repository),
    new ListActivityLogActionTypes(repository),
    new ListActivityLogEntityTypes(repository),
  );

  return {
    activityLogs: {
      list: (input) => controller.list(input as never),
      summary: () => controller.summary(),
      clear: () => controller.clear(),
      create: (input) => controller.create(input),
      "action-types": () => controller.actionTypesList(),
      "entity-types": () => controller.entityTypesList(),
    },
  };
}
