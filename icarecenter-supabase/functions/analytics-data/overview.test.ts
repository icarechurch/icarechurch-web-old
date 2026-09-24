import { createAnalyticsOverviewHandler } from "./overview.ts";

type RpcResponse = {
  data: Array<Record<string, unknown>> | null;
  error: unknown;
};

Deno.test("loads the dashboard overview through one bounded database RPC", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const response: RpcResponse = {
    data: [
      {
        summary: { total_visits: 10 },
        daily_visits: [],
        page_popularity: [],
        recent_visits: [],
        content_analytics: {
          total_ministries: 1,
          total_events: 2,
          scheduled_events: 1,
          postponed_events: 0,
          done_events: 1,
        },
      },
    ],
    error: null,
  };
  const client = {
    rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });
      return Promise.resolve(response);
    },
  };

  const result = await createAnalyticsOverviewHandler(client as never)({
    daysBack: 30,
    recentLimit: 20,
  });

  if (calls.length !== 1) {
    throw new Error("Expected one overview RPC request");
  }

  if (
    JSON.stringify(calls[0]) !==
    JSON.stringify({
      name: "get_analytics_overview",
      args: { days_back: 30, recent_limit: 20 },
    })
  ) {
    throw new Error("Overview RPC arguments changed");
  }

  if ((result.summary as { total_visits: number }).total_visits !== 10) {
    throw new Error("Overview summary was not returned");
  }
});

Deno.test("rejects overview limits outside the supported bounds", async () => {
  const client = {
    rpc() {
      throw new Error("The database should not be called for invalid input");
    },
  };

  try {
    await createAnalyticsOverviewHandler(client as never)({
      daysBack: 366,
      recentLimit: 20,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "HttpError") return;
    throw error;
  }

  throw new Error("Expected invalid overview input to be rejected");
});
