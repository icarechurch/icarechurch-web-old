import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const EMPTY_LOG_ID = "00000000-0000-0000-0000-000000000000";

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
      let query = client
        .from("activity_logs")
        .select("*", { count: "exact" })
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
      const { data, error } = await client
        .from("activity_logs")
        .select("action_type");

      if (error) throw error;
      return data ?? [];
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
      const { data, error } = await client
        .from("activity_logs")
        .select("action_type");

      if (error) throw error;
      return data ?? [];
    },

    async "entity-types"() {
      const { data, error } = await client
        .from("activity_logs")
        .select("entity_type");

      if (error) throw error;
      return data ?? [];
    },
  };
}
