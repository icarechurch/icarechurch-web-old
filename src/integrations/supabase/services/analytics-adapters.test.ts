import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../client";
import { analyticsService } from "./analytics.service";

vi.mock("../client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const invoke = vi.mocked(supabase.functions.invoke);

describe("analytics service adapters", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("tracks a page visit through analytics-data", async () => {
    const payload = {
      page_path: "/about",
      visitor_id: "visitor-1",
      session_id: "session-1",
      user_agent: "browser",
      referrer: null,
    };
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(analyticsService.trackPageVisit(payload)).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: { resource: "analytics", operation: "track-visit", input: payload },
    });
  });

  it("loads the analytics summary with its day window", async () => {
    const summary = { total_visits: 4 };
    invoke.mockResolvedValue({ data: { data: summary }, error: null });

    await expect(analyticsService.getSummary(14)).resolves.toEqual(summary);
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: { resource: "analytics", operation: "summary", input: { daysBack: 14 } },
    });
  });

  it("loads daily visits through analytics-data", async () => {
    const rows = [{ date: "2026-01-01", total_visits: 2, unique_visitors: 1 }];
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(analyticsService.getDailyVisits(7)).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: {
        resource: "analytics",
        operation: "daily-visits",
        input: { daysBack: 7 },
      },
    });
  });

  it("loads page popularity through analytics-data", async () => {
    const rows = [{ page_path: "/", total_visits: 3, unique_visitors: 2 }];
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(analyticsService.getPagePopularity(30)).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: {
        resource: "analytics",
        operation: "page-popularity",
        input: { daysBack: 30 },
      },
    });
  });

  it("loads recent visits through analytics-data", async () => {
    const rows = [{ id: "visit-1", page_path: "/" }];
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(analyticsService.getRecentVisits(25)).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: {
        resource: "analytics",
        operation: "recent-visits",
        input: { limit: 25 },
      },
    });
  });

  it("loads content analytics source rows through analytics-data", async () => {
    const rows = { ministries: [{ id: "ministry-1" }], events: [{ id: "event-1" }] };
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(analyticsService.getContentAnalyticsRows()).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("analytics-data", {
      body: { resource: "analytics", operation: "content" },
    });
  });
});
