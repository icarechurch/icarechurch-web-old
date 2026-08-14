import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { ContentAnalytics } from "@/domains/analytics/model/analytics.types";

export type AnalyticsVisitPayload = {
  page_path: string;
  visitor_id: string;
  session_id: string;
  user_agent: string;
  referrer: string | null;
};

export type AnalyticsSummary = {
  total_visits: number;
  unique_visitors: number;
  total_pages: number;
  avg_daily_visits: number;
  top_pages: unknown[];
};

export type AnalyticsDailyStat = {
  date: string;
  total_visits: number;
  unique_visitors: number;
  page_path: string | null;
};

export type AnalyticsPageStat = {
  page_path: string;
  total_visits: number;
  unique_visitors: number;
};

export type AnalyticsRecentVisit = {
  id: string;
  page_path: string;
  visited_at: string;
  user_agent: string | null;
  referrer: string | null;
};

export type ContentAnalyticsRows = {
  ministries: Array<{ id: string }>;
  events: Array<{ id: string; status: string | null }>;
};

export type AnalyticsOverview = {
  summary: AnalyticsSummary | null;
  dailyVisits: AnalyticsDailyStat[];
  pagePopularity: AnalyticsPageStat[];
  recentVisits: AnalyticsRecentVisit[];
  contentAnalytics: ContentAnalytics | null;
};

export const analyticsService = {
  async trackPageVisit(payload: AnalyticsVisitPayload): Promise<void> {
    await invokeFunction<null>("analytics-data", {
      resource: "analytics",
      operation: "track-visit",
      input: payload,
    });
  },

  getSummary(daysBack: number): Promise<AnalyticsSummary | null> {
    return invokeFunction<AnalyticsSummary | null>("analytics-data", {
      resource: "analytics",
      operation: "summary",
      input: { daysBack },
    });
  },

  getDailyVisits(daysBack: number): Promise<AnalyticsDailyStat[]> {
    return invokeFunction<AnalyticsDailyStat[]>("analytics-data", {
      resource: "analytics",
      operation: "daily-visits",
      input: { daysBack },
    });
  },

  getPagePopularity(daysBack: number): Promise<AnalyticsPageStat[]> {
    return invokeFunction<AnalyticsPageStat[]>("analytics-data", {
      resource: "analytics",
      operation: "page-popularity",
      input: { daysBack },
    });
  },

  getRecentVisits(limit: number): Promise<AnalyticsRecentVisit[]> {
    return invokeFunction<AnalyticsRecentVisit[]>("analytics-data", {
      resource: "analytics",
      operation: "recent-visits",
      input: { limit },
    });
  },

  getContentAnalyticsRows(): Promise<ContentAnalyticsRows> {
    return invokeFunction<ContentAnalyticsRows>("analytics-data", {
      resource: "analytics",
      operation: "content",
    });
  },

  getOverview(daysBack = 30, recentLimit = 20): Promise<AnalyticsOverview> {
    return invokeFunction<AnalyticsOverview>("analytics-data", {
      resource: "analytics",
      operation: "overview",
      input: { daysBack, recentLimit },
    });
  },
};
