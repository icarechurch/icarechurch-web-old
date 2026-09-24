import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "../_shared/errors.ts";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const MAX_ANALYTICS_DAYS = 365;
export const MAX_RECENT_VISITS = 100;

function getBoundedInteger(
  input: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number {
  const value =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)[field]
      : undefined;

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new HttpError(
      400,
      "INVALID_INPUT",
      `${field} must be an integer between ${minimum} and ${maximum}`,
    );
  }

  return value;
}

export function validateAnalyticsDaysBack(value: unknown): number {
  return getBoundedInteger(
    { daysBack: value },
    "daysBack",
    0,
    MAX_ANALYTICS_DAYS,
  );
}

export function validateRecentVisitLimit(value: unknown): number {
  return getBoundedInteger(
    { limit: value },
    "limit",
    1,
    MAX_RECENT_VISITS,
  );
}

export function getAnalyticsStartDate(daysBack: number): string {
  return new Date(Date.now() - daysBack * MILLISECONDS_PER_DAY)
    .toISOString()
    .split("T")[0];
}

export function createAnalyticsHandlers(client: SupabaseClient) {
  return {
    async "track-visit"(payload: unknown) {
      const { error } = await client
        .from("analytics_visits")
        .insert(payload as Record<string, unknown>);
      if (error) throw error;
      return null;
    },

    async summary(input: { daysBack: number }) {
      const daysBack = validateAnalyticsDaysBack(input?.daysBack);
      const { data, error } = await client.rpc("get_analytics_summary", {
        days_back: daysBack,
      });

      if (error) throw error;
      return data?.[0] ?? null;
    },

    async "daily-visits"(input: { daysBack: number }) {
      const daysBack = validateAnalyticsDaysBack(input?.daysBack);
      const { data, error } = await client
        .from("analytics_daily_stats")
        .select("date, total_visits, unique_visitors, page_path")
        .gte("date", getAnalyticsStartDate(daysBack))
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },

    async "page-popularity"(input: { daysBack: number }) {
      const daysBack = validateAnalyticsDaysBack(input?.daysBack);
      const { data, error } = await client
        .from("analytics_daily_stats")
        .select("page_path, total_visits, unique_visitors")
        .gte("date", getAnalyticsStartDate(daysBack))
        .order("total_visits", { ascending: false });

      if (error) throw error;
      return data;
    },

    async "recent-visits"(input: { limit: number }) {
      const limit = validateRecentVisitLimit(input?.limit);
      const { data, error } = await client
        .from("analytics_visits")
        .select("id, page_path, visited_at, user_agent, referrer")
        .order("visited_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },

    async content() {
      const [ministriesResult, eventsResult] = await Promise.all([
        client.from("ministries").select("id"),
        client.from("events").select("id, status"),
      ]);

      if (ministriesResult.error) throw ministriesResult.error;
      if (eventsResult.error) throw eventsResult.error;

      return {
        ministries: ministriesResult.data,
        events: eventsResult.data,
      };
    },
  };
}
