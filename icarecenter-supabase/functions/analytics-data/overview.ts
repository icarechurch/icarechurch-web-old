import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  validateAnalyticsDaysBack,
  validateRecentVisitLimit,
} from "./queries.ts";

export type AnalyticsOverviewInput = {
  daysBack?: unknown;
  recentLimit?: unknown;
};

export type AnalyticsOverview = {
  summary: Record<string, unknown> | null;
  dailyVisits: Array<Record<string, unknown>>;
  pagePopularity: Array<Record<string, unknown>>;
  recentVisits: Array<Record<string, unknown>>;
  contentAnalytics: Record<string, unknown> | null;
};

type AnalyticsOverviewRow = {
  summary: Record<string, unknown> | null;
  daily_visits: Array<Record<string, unknown>> | null;
  page_popularity: Array<Record<string, unknown>> | null;
  recent_visits: Array<Record<string, unknown>> | null;
  content_analytics: Record<string, unknown> | null;
};

export function createAnalyticsOverviewHandler(client: SupabaseClient) {
  return async (
    input: AnalyticsOverviewInput = {},
  ): Promise<AnalyticsOverview> => {
    const daysBack = validateAnalyticsDaysBack(input.daysBack ?? 30);
    const recentLimit = validateRecentVisitLimit(input.recentLimit ?? 20);
    const { data, error } = await client.rpc("get_analytics_overview", {
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
  };
}
