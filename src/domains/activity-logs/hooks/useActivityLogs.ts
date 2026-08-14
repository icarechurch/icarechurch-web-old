import { useState, useCallback } from "react";
import {
  type ActivityLogInsert,
  type LogActionType,
} from "@/domains/activity-logs/model/logging.types";
import {
  activityLogsService,
  type ActivityLogQuery,
  type ActivityLogsResult,
} from "@/domains/activity-logs/api/activity-logs.api";
import { useQuery } from "@/shared/hooks/simple-query-hooks";

export interface LogFilters {
  startDate?: Date;
  endDate?: Date;
  actionType?: string;
  entityType?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export type LogsResult = ActivityLogsResult;

// Hook to fetch logs with filtering
export const useLogs = (filters: LogFilters = {}) => {
  const {
    startDate,
    endDate,
    actionType,
    entityType,
    userId,
    limit = 50,
    offset = 0,
  } = filters;

  return useQuery({
    queryKey: [
      "activity-logs",
      startDate?.toISOString(),
      endDate?.toISOString(),
      actionType,
      entityType,
      userId,
      limit,
      offset,
    ],
    queryFn: async (): Promise<LogsResult> => {
      const input: ActivityLogQuery = { limit, offset };

      if (startDate) {
        input.startDate = startDate.toISOString();
      }

      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        input.endDate = endOfDay.toISOString();
      }

      if (actionType) {
        input.actionType = actionType;
      }

      if (entityType) {
        input.entityType = entityType;
      }

      if (userId) {
        input.userId = userId;
      }

      return activityLogsService.getLogs(input);
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

// Hook to get log action type counts
export const useLogSummary = () => {
  return useQuery({
    queryKey: ["log-summary"],
    queryFn: async () => {
      const summary = await activityLogsService.getSummary();

      return {
        total: summary.total,
        byActionType: summary.by_action_type,
      };
    },
    refetchInterval: 60_000,
  });
};

// Hook for clearing all logs
export const useClearLogs = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearLogs = useCallback(async () => {
    setIsClearing(true);
    setError(null);

    try {
      // Delete all logs - we need a condition, so we delete where id is not null
      await activityLogsService.clearLogs();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to clear logs"));
      return false;
    } finally {
      setIsClearing(false);
    }
  }, []);

  return { clearLogs, isClearing, error };
};

// Utility function to log an activity
export const logActivity = async (
  actionType: LogActionType,
  options: {
    description?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
    pagePath?: string;
  } = {},
) => {
  try {
    const payload: ActivityLogInsert = {
      action_type: actionType,
      action_description: options.description,
      entity_type: options.entityType,
      entity_id: options.entityId,
      user_id: options.userId,
      user_email: options.userEmail,
      metadata: options.metadata ?? {},
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      page_path:
        options.pagePath ??
        (typeof window !== "undefined" ? window.location.pathname : null),
    };

    await activityLogsService.logActivity(payload);
  } catch (_error) {
    // Silently fail
  }
};

// Get distinct action types for filter dropdown
export const useLogActionTypes = () => {
  return useQuery({
    queryKey: ["log-action-types"],
    queryFn: async () => {
      const data = await activityLogsService.getActionTypeRows();

      const uniqueTypes = [
        ...new Set(data?.map((log) => log.action_type) ?? []),
      ];
      return uniqueTypes.sort();
    },
    refetchInterval: 300_000, // Refetch every 5 minutes
  });
};

// Get distinct entity types for filter dropdown
export const useLogEntityTypes = () => {
  return useQuery({
    queryKey: ["log-entity-types"],
    queryFn: async () => {
      const data = await activityLogsService.getEntityTypeRows();

      const uniqueTypes = [
        ...new Set(
          data
            ?.map((log) => log.entity_type)
            .filter((entityType): entityType is string => Boolean(entityType)) ??
            [],
        ),
      ];
      return uniqueTypes.sort();
    },
    refetchInterval: 300_000,
  });
};
