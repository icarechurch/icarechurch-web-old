import { invokeFunction } from "@/infrastructure/supabase/functions";
import type {
  ActivityLog,
  ActivityLogInsert,
} from "../loggingTypes";

export type ActivityLogQuery = {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  entityType?: string;
  userId?: string;
  limit: number;
  offset: number;
};

export type ActivityLogsResult = {
  logs: ActivityLog[];
  totalCount: number;
};

export const activityLogsService = {
  getLogs(input: ActivityLogQuery): Promise<ActivityLogsResult> {
    return invokeFunction<ActivityLogsResult>("activity-logs", {
      resource: "activity-logs",
      operation: "list",
      input,
    });
  },

  getActionTypeRows(): Promise<Array<{ action_type: string }>> {
    return invokeFunction<Array<{ action_type: string }>>("activity-logs", {
      resource: "activity-logs",
      operation: "action-types",
    });
  },

  clearLogs(): Promise<void> {
    return invokeFunction<null>("activity-logs", {
      resource: "activity-logs",
      operation: "clear",
    }).then(() => undefined);
  },

  logActivity(payload: ActivityLogInsert): Promise<void> {
    return invokeFunction<null>("activity-logs", {
      resource: "activity-logs",
      operation: "create",
      input: payload,
    }).then(() => undefined);
  },

  getEntityTypeRows(): Promise<Array<{ entity_type: string | null }>> {
    return invokeFunction<Array<{ entity_type: string | null }>>("activity-logs", {
      resource: "activity-logs",
      operation: "entity-types",
    });
  },
};
