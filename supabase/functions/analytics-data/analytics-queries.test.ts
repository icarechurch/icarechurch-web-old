import {
  createAnalyticsHandlers,
  getAnalyticsStartDate,
} from "./queries.ts";

type Action = { method: string; args: unknown[] };

function createQuery(actions: Action[], result: unknown) {
  const query = {
    select(...args: unknown[]) {
      actions.push({ method: "select", args });
      return query;
    },
    insert(...args: unknown[]) {
      actions.push({ method: "insert", args });
      return query;
    },
    gte(...args: unknown[]) {
      actions.push({ method: "gte", args });
      return query;
    },
    order(...args: unknown[]) {
      actions.push({ method: "order", args });
      return query;
    },
    limit(...args: unknown[]) {
      actions.push({ method: "limit", args });
      return query;
    },
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return query;
}

function createClient() {
  const actions: Action[] = [];
  const results = new Map<string, unknown>();
  const client = {
    from(table: string) {
      return createQuery(actions, results.get(table) ?? { data: [], error: null });
    },
    rpc(name: string, args: unknown) {
      actions.push({ method: "rpc", args: [name, args] });
      return Promise.resolve({ data: [{ total_visits: 1 }], error: null });
    },
  };

  return { actions, client, results };
}

const operation = (handlers: ReturnType<typeof createAnalyticsHandlers>, name: string) =>
  handlers[name as keyof typeof handlers] as (...args: unknown[]) => Promise<unknown>;

Deno.test("preserves the analytics visit insert query", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);
  const payload = { page_path: "/", visitor_id: "visitor-1" };

  await operation(handlers, "track-visit")(payload);

  if (actions.length !== 1) throw new Error("Expected one query action");
  if (actions[0].method !== "insert") throw new Error("Expected insert");
  if (JSON.stringify(actions[0].args) !== JSON.stringify([payload])) {
    throw new Error("Insert payload changed");
  }
});

Deno.test("preserves the analytics summary RPC", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);

  await operation(handlers, "summary")({ daysBack: 14 });

  if (JSON.stringify(actions[0]) !== JSON.stringify({
    method: "rpc",
    args: ["get_analytics_summary", { days_back: 14 }],
  })) {
    throw new Error("Summary RPC changed");
  }
});

Deno.test("preserves the daily visits query", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);
  const date = getAnalyticsStartDate(30);

  await operation(handlers, "daily-visits")({ daysBack: 30 });

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["date, total_visits, unique_visitors, page_path"] },
    { method: "gte", args: ["date", date] },
    { method: "order", args: ["date", { ascending: true }] },
  ])) {
    throw new Error("Daily visits query changed");
  }
});

Deno.test("preserves the page popularity query", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);
  const date = getAnalyticsStartDate(30);

  await operation(handlers, "page-popularity")({ daysBack: 30 });

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["page_path, total_visits, unique_visitors"] },
    { method: "gte", args: ["date", date] },
    { method: "order", args: ["total_visits", { ascending: false }] },
  ])) {
    throw new Error("Page popularity query changed");
  }
});

Deno.test("preserves the recent visits query", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);

  await operation(handlers, "recent-visits")({ limit: 50 });

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["id, page_path, visited_at, user_agent, referrer"] },
    { method: "order", args: ["visited_at", { ascending: false }] },
    { method: "limit", args: [50] },
  ])) {
    throw new Error("Recent visits query changed");
  }
});

Deno.test("preserves the content analytics queries", async () => {
  const { actions, client } = createClient();
  const handlers = createAnalyticsHandlers(client as never);

  await operation(handlers, "content")();

  const selects = actions.filter((action) => action.method === "select");
  if (JSON.stringify(selects) !== JSON.stringify([
    { method: "select", args: ["id"] },
    { method: "select", args: ["id, status"] },
  ])) {
    throw new Error("Content analytics queries changed");
  }
});
