import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type ActivityLog,
  type ActivityLogInsert,
  type LogActionType,
} from "@/integrations/supabase/loggingTypes";
import { useQuery } from "./simple-query-hooks";


export interface LogFilters {
  startDate?: Date;
  endDate?: Date;
  actionType?: string;
  entityType?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResult {
  logs: ActivityLog[];
  totalCount: number;
}

// Hook to fetch logs with filtering
export const useLogs = (filters: LogFilters = {}) => {
  const { startDate, endDate, actionType, entityType, userId, limit = 50, offset = 0 } = filters;

  return useQuery({
    queryKey: ["activity-logs", startDate?.toISOString(), endDate?.toISOString(), actionType, entityType, userId, limit, offset],
    queryFn: async (): Promise<LogsResult> => {
      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      if (endDate) {
        // Set end of day for the end date
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      if (actionType) {
        query = query.eq("action_type", actionType);
      }

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        totalCount: count || 0,
      };
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

// Hook to get log action type counts
export const useLogSummary = () => {
  return useQuery({
    queryKey: ["log-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("action_type");

      if (error) throw error;

      // Count by action type
      const counts: Record<string, number> = {};
      for (const log of data || []) {
        counts[log.action_type] = (counts[log.action_type] || 0) + 1;
      }

      return {
        total: data?.length || 0,
        byActionType: counts,
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
      const { error: deleteError } = await supabase
        .from("activity_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

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
  } = {}
) => {
  try {
    const payload: ActivityLogInsert = {
      action_type: actionType,
      action_description: options.description,
      entity_type: options.entityType,
      entity_id: options.entityId,
      user_id: options.userId,
      user_email: options.userEmail,
      metadata: options.metadata || {},
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      page_path: options.pagePath || (typeof window !== "undefined" ? window.location.pathname : null),
    };

    const { error } = await supabase
      .from("activity_logs")
      .insert(payload);

    if (error) {
      // Silently fail - logging should not break the application
    }
  } catch (_error) {
    // Silently fail
  }
};

// Get distinct action types for filter dropdown
export const useLogActionTypes = () => {
  return useQuery({
    queryKey: ["log-action-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("action_type");

      if (error) throw error;

      // Get unique action types
      const uniqueTypes = [...new Set(data?.map((log) => log.action_type) || [])];
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
      const { data, error } = await supabase
        .from("activity_logs")
        .select("entity_type");

      if (error) throw error;

      // Get unique entity types, filtering out nulls
      const uniqueTypes = [...new Set(data?.map((log) => log.entity_type).filter(Boolean) || [])];
      return uniqueTypes.sort() as string[];
    },
    refetchInterval: 300_000,
  });
};
