import { useEffect } from "react";
import {
  analyticsService,
  type AnalyticsOverview,
  type AnalyticsVisitPayload,
} from "@/domains/analytics/api/analytics.api";
import { useQuery } from "@/shared/hooks/simple-query-hooks";

const DEFAULT_OVERVIEW: AnalyticsOverview = {
  summary: {
    total_visits: 0,
    unique_visitors: 0,
    total_pages: 0,
    avg_daily_visits: 0,
    top_pages: [],
  },
  dailyVisits: [],
  pagePopularity: [],
  recentVisits: [],
  contentAnalytics: {
    total_ministries: 0,
    total_events: 0,
    scheduled_events: 0,
    postponed_events: 0,
    done_events: 0,
  },
};

const getVisitorId = (): string => {
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

export const trackPageVisit = async (pagePath: string): Promise<void> => {
  try {
    const payload: AnalyticsVisitPayload = {
      page_path: pagePath,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    };

    await analyticsService.trackPageVisit(payload);
  } catch (_error) {
    // Analytics tracking is intentionally best effort.
  }
};

export const usePageTracking = (pagePath: string): void => {
  useEffect(() => {
    trackPageVisit(pagePath);
  }, [pagePath]);
};

export const useAnalyticsOverview = (
  daysBack = 30,
  recentLimit = 20,
) =>
  useQuery({
    queryKey: ["analytics-overview", daysBack, recentLimit],
    queryFn: async () => {
      try {
        return await analyticsService.getOverview(daysBack, recentLimit);
      } catch (_error) {
        return DEFAULT_OVERVIEW;
      }
    },
    refetchInterval: 60_000,
    retry: 3,
  });
