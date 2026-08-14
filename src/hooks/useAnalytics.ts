import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "./simple-query-hooks";

export interface ContentAnalytics {
  total_ministries: number;
  total_events: number;
  scheduled_events: number;
  postponed_events: number;
  done_events: number;
}

// Generate a unique visitor ID that persists across sessions
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

// Generate a session ID that's unique per browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

// Track a page visit — only if the user has granted analytics consent
export const ANALYTICS_CONSENT_KEY = "analytics_consent";

export const trackPageVisit = async (pagePath: string) => {
  if (localStorage.getItem(ANALYTICS_CONSENT_KEY) !== "true") return;
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    const payload = {
      page_path: pagePath,
      visitor_id: visitorId,
      session_id: sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    };

    const { data, error } = await supabase
      .from("analytics_visits")
      .insert(payload);

    if (error) {
      // Analytics tracking failed silently
    }
  } catch (_error) {
    // Analytics tracking failed silently
  }
};

// Hook to automatically track page visits
export const usePageTracking = (pagePath: string) => {
  useEffect(() => {
    trackPageVisit(pagePath);
  }, [pagePath]);
};

// Hook to fetch analytics summary (admin only)
export const useAnalyticsSummary = (daysBack = 30) => {
  return useQuery({
    queryKey: ["analytics-summary", daysBack],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_analytics_summary", {
          days_back: daysBack,
        });

        if (error) {
          throw error;
        }

        return (
          data?.[0] || {
            total_visits: 0,
            unique_visitors: 0,
            total_pages: 0,
            avg_daily_visits: 0,
            top_pages: [],
          }
        );
      } catch (_error) {
        // Return default values on error
        return {
          total_visits: 0,
          unique_visitors: 0,
          total_pages: 0,
          avg_daily_visits: 0,
          top_pages: [],
        };
      }
    },
    refetchInterval: 60_000, // Refetch every minute
    retry: 3,
  });
};

// Hook to fetch daily visits for charts (admin only)
export const useDailyVisits = (daysBack = 30) => {
  return useQuery({
    queryKey: ["daily-visits", daysBack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_daily_stats")
        .select("date, total_visits, unique_visitors, page_path")
        .gte(
          "date",
          new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("date", { ascending: true });

      if (error) throw error;

      // Group by date and sum visits
      const groupedData = data?.reduce(
        (acc, item) => {
          const date = item.date;
          if (!acc[date]) {
            acc[date] = {
              date,
              total_visits: 0,
              unique_visitors: 0,
            };
          }
          acc[date].total_visits += item.total_visits;
          acc[date].unique_visitors += item.unique_visitors;
          return acc;
        },
        {} as Record<
          string,
          { date: string; total_visits: number; unique_visitors: number }
        >
      );

      return Object.values(groupedData || {});
    },
  });
};

// Hook to fetch page popularity data (admin only)
export const usePagePopularity = (daysBack = 30) => {
  return useQuery({
    queryKey: ["page-popularity", daysBack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_daily_stats")
        .select("page_path, total_visits, unique_visitors")
        .gte(
          "date",
          new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("total_visits", { ascending: false });

      if (error) throw error;

      // Group by page and sum visits
      const groupedData = data?.reduce(
        (acc, item) => {
          const page = item.page_path;
          if (!acc[page]) {
            acc[page] = {
              page_path: page,
              total_visits: 0,
              unique_visitors: 0,
            };
          }
          acc[page].total_visits += item.total_visits;
          acc[page].unique_visitors += item.unique_visitors;
          return acc;
        },
        {} as Record<
          string,
          { page_path: string; total_visits: number; unique_visitors: number }
        >
      );

      return Object.values(groupedData || {})
        .sort((a, b) => b.total_visits - a.total_visits)
        .slice(0, 10); // Top 10 pages
    },
  });
};

// Hook to fetch recent visits (admin only)
export const useRecentVisits = (limit = 50) => {
  return useQuery({
    queryKey: ["recent-visits", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_visits")
        .select("id, page_path, visited_at, user_agent, referrer")
        .order("visited_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

// Hook to fetch content analytics (admin only)
export const useContentAnalytics = () => {
  return useQuery({
    queryKey: ["content-analytics"],
    queryFn: async (): Promise<ContentAnalytics> => {
      try {
        // Get ministries count
        const { data: ministriesData, error: ministriesError } = await supabase
          .from("ministries")
          .select("id");

        if (ministriesError) throw ministriesError;

        // Get events with status filtering
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, status");

        if (eventsError) throw eventsError;

        const scheduledEvents =
          eventsData?.filter((event) => event.status === "scheduled") || [];
        const postponedEvents =
          eventsData?.filter((event) => event.status === "postponed") || [];
        const doneEvents =
          eventsData?.filter((event) => event.status === "done") || [];

        return {
          total_ministries: ministriesData?.length || 0,
          total_events: eventsData?.length || 0,
          scheduled_events: scheduledEvents.length,
          postponed_events: postponedEvents.length,
          done_events: doneEvents.length,
        };
      } catch (_error) {
        return {
          total_ministries: 0,
          total_events: 0,
          scheduled_events: 0,
          postponed_events: 0,
          done_events: 0,
        };
      }
    },
    refetchInterval: 60_000, // Refetch every minute
  });
};
