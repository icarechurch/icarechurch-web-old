import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "../../../../_shared/errors.ts";
import type {
  ActivityLogListInput,
  ActivityLogRepository,
} from "../domain/ports/ActivityLogRepository.ts";

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

export class SupabaseActivityLogRepository implements ActivityLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(input: ActivityLogListInput): Promise<unknown> {
    validatePagination(input.limit, input.offset);
    let query = this.client
      .from("activity_logs")
      .select(ACTIVITY_LOG_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.startDate) query = query.gte("created_at", input.startDate);
    if (input.endDate) query = query.lte("created_at", input.endDate);
    if (input.actionType) query = query.eq("action_type", input.actionType);
    if (input.entityType) query = query.eq("entity_type", input.entityType);
    if (input.userId) query = query.eq("user_id", input.userId);

    const { data, error, count } = await query;
    if (error) throw error;

    return { logs: data ?? [], totalCount: count ?? 0 };
  }

  async summary(): Promise<unknown> {
    const { data, error } = await this.client.rpc(
      "get_activity_log_summary",
      {},
    );
    if (error) throw error;
    return data?.[0] ?? { total: 0, by_action_type: {} };
  }

  async clear(): Promise<null> {
    const { error } = await this.client
      .from("activity_logs")
      .delete()
      .neq("id", EMPTY_LOG_ID);
    if (error) throw error;
    return null;
  }

  async create(payload: unknown): Promise<null> {
    const { error } = await this.client
      .from("activity_logs")
      .insert(payload as Record<string, unknown>);
    if (error) throw error;
    return null;
  }

  async actionTypes(): Promise<unknown> {
    const { data, error } = await this.client.rpc(
      "get_activity_log_action_types",
      {},
    );
    if (error) throw error;
    return data ?? [];
  }

  async entityTypes(): Promise<unknown> {
    const { data, error } = await this.client.rpc(
      "get_activity_log_entity_types",
      {},
    );
    if (error) throw error;
    return data ?? [];
  }
}
