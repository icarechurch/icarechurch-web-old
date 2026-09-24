import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "../_shared/errors.ts";

const EMPTY_LOG_ID = "00000000-0000-0000-0000-000000000000";
export const MAX_ACTIVITY_LOG_LIMIT = 100;
const ACTIVITY_LOG_COLUMNS =
  "id, action_type, action_description, entity_type, entity_id, user_id, user_email, metadata, ip_address, user_agent, page_path, created_at";

function validatePagination(limit: number, offset: number): void {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_ACTIVITY_LOG_LIMIT ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new HttpError(
      400,
      "INVALID_INPUT",
      `limit must be between 1 and ${MAX_ACTIVITY_LOG_LIMIT} and offset must be non-negative`,
    );
  }
}

export function createActivityLogHandlers(client: SupabaseClient) {
  return {
    async list(input: {
      startDate?: string;
      endDate?: string;
      actionType?: string;
      entityType?: string;
      userId?: string;
      limit: number;
      offset: number;
    }) {
      validatePagination(input.limit, input.offset);
      let query = client
        .from("activity_logs")
        .select(ACTIVITY_LOG_COLUMNS, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.startDate) {
        query = query.gte("created_at", input.startDate);
      }

      if (input.endDate) {
        query = query.lte("created_at", input.endDate);
      }

      if (input.actionType) {
        query = query.eq("action_type", input.actionType);
      }

      if (input.entityType) {
        query = query.eq("entity_type", input.entityType);
      }

      if (input.userId) {
        query = query.eq("user_id", input.userId);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        logs: data ?? [],
        totalCount: count ?? 0,
      };
    },

    async summary() {
      const { data, error } = await client.rpc("get_activity_log_summary", {});

      if (error) throw error;
      return data?.[0] ?? { total: 0, by_action_type: {} };
    },

    async clear() {
      const { error } = await client
        .from("activity_logs")
        .delete()
        .neq("id", EMPTY_LOG_ID);

      if (error) throw error;
      return null;
    },

    async create(payload: unknown) {
      const { error } = await client
        .from("activity_logs")
        .insert(payload as Record<string, unknown>);

      if (error) throw error;
      return null;
    },

    async "action-types"() {
      const { data, error } = await client.rpc(
        "get_activity_log_action_types",
        {},
      );

      if (error) throw error;
      return data ?? [];
    },

    async "entity-types"() {
      const { data, error } = await client.rpc(
        "get_activity_log_entity_types",
        {},
      );

      if (error) throw error;
      return data ?? [];
    },
  };
}
