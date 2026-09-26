import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "../../../_shared/errors.ts";
import type {
  AnalyticsOverview,
  AnalyticsOverviewInput,
  AnalyticsRepository,
} from "../domain/ports/AnalyticsRepository.ts";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const MAX_ANALYTICS_DAYS = 365;
export const MAX_RECENT_VISITS = 100;

function getBoundedInteger(
  input: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number {
  const value = input && typeof input === "object"
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

type AnalyticsOverviewRow = {
  summary: Record<string, unknown> | null;
  daily_visits: Array<Record<string, unknown>> | null;
  page_popularity: Array<Record<string, unknown>> | null;
  recent_visits: Array<Record<string, unknown>> | null;
  content_analytics: Record<string, unknown> | null;
};

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async trackVisit(payload: unknown): Promise<null> {
    const { error } = await this.client
      .from("analytics_visits")
      .insert(payload as Record<string, unknown>);
    if (error) throw error;
    return null;
  }

  async summary(input: { daysBack: unknown }): Promise<unknown> {
    const daysBack = validateAnalyticsDaysBack(input?.daysBack);
    const { data, error } = await this.client.rpc("get_analytics_summary", {
      days_back: daysBack,
    });

    if (error) throw error;
    return data?.[0] ?? null;
  }

  async dailyVisits(input: { daysBack: unknown }): Promise<unknown> {
    const daysBack = validateAnalyticsDaysBack(input?.daysBack);
    const { data, error } = await this.client
      .from("analytics_daily_stats")
      .select("date, total_visits, unique_visitors, page_path")
      .gte("date", getAnalyticsStartDate(daysBack))
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  }

  async pagePopularity(input: { daysBack: unknown }): Promise<unknown> {
    const daysBack = validateAnalyticsDaysBack(input?.daysBack);
    const { data, error } = await this.client
      .from("analytics_daily_stats")
      .select("page_path, total_visits, unique_visitors")
      .gte("date", getAnalyticsStartDate(daysBack))
      .order("total_visits", { ascending: false });

    if (error) throw error;
    return data;
  }

  async recentVisits(input: { limit: unknown }): Promise<unknown> {
    const limit = validateRecentVisitLimit(input?.limit);
    const { data, error } = await this.client
      .from("analytics_visits")
      .select("id, page_path, visited_at, user_agent, referrer")
      .order("visited_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async content(): Promise<unknown> {
    const [ministriesResult, eventsResult] = await Promise.all([
      this.client.from("ministries").select("id"),
      this.client.from("events").select("id, status"),
    ]);

    if (ministriesResult.error) throw ministriesResult.error;
    if (eventsResult.error) throw eventsResult.error;

    return {
      ministries: ministriesResult.data,
      events: eventsResult.data,
    };
  }

  async overview(
    input: AnalyticsOverviewInput = {},
  ): Promise<AnalyticsOverview> {
    const daysBack = validateAnalyticsDaysBack(input.daysBack ?? 30);
    const recentLimit = validateRecentVisitLimit(input.recentLimit ?? 20);
    const { data, error } = await this.client.rpc("get_analytics_overview", {
      days_back: daysBack,
      recent_limit: recentLimit,
    });

    if (error) throw error;

    const row = (data?.[0] ?? null) as AnalyticsOverviewRow | null;
    return {
      summary: row?.summary ?? null,
      dailyVisits: row?.daily_visits ?? [],
      pagePopularity: row?.page_popularity ?? [],
      recentVisits: row?.recent_visits ?? [],
      contentAnalytics: row?.content_analytics ?? null,
    };
  }
}
