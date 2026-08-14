import { createActivityLogHandlers } from "./queries.ts";

type Action = { method: string; args: unknown[] };

function createQuery(actions: Action[], result: unknown) {
  const query = {
    select(...args: unknown[]) {
      actions.push({ method: "select", args });
      return query;
    },
    order(...args: unknown[]) {
      actions.push({ method: "order", args });
      return query;
    },
    range(...args: unknown[]) {
      actions.push({ method: "range", args });
      return query;
    },
    gte(...args: unknown[]) {
      actions.push({ method: "gte", args });
      return query;
    },
    lte(...args: unknown[]) {
      actions.push({ method: "lte", args });
      return query;
    },
    eq(...args: unknown[]) {
      actions.push({ method: "eq", args });
      return query;
    },
    neq(...args: unknown[]) {
      actions.push({ method: "neq", args });
      return query;
    },
    insert(...args: unknown[]) {
      actions.push({ method: "insert", args });
      return query;
    },
    delete() {
      actions.push({ method: "delete", args: [] });
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
  const client = {
    from() {
      return createQuery(actions, { data: [], error: null, count: 0 });
    },
  };

  return { actions, client };
}

const operation = (
  handlers: ReturnType<typeof createActivityLogHandlers>,
  name: string,
) => handlers[name as keyof typeof handlers] as (...args: unknown[]) => Promise<unknown>;

Deno.test("preserves filtered activity log query clauses", async () => {
  const { actions, client } = createClient();
  const handlers = createActivityLogHandlers(client as never);

  await operation(handlers, "list")({
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-01-31T23:59:59.999Z",
    actionType: "create_event",
    entityType: "event",
    userId: "user-1",
    limit: 25,
    offset: 50,
  });

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["*", { count: "exact" }] },
    { method: "order", args: ["created_at", { ascending: false }] },
    { method: "range", args: [50, 74] },
    { method: "gte", args: ["created_at", "2026-01-01T00:00:00.000Z"] },
    { method: "lte", args: ["created_at", "2026-01-31T23:59:59.999Z"] },
    { method: "eq", args: ["action_type", "create_event"] },
    { method: "eq", args: ["entity_type", "event"] },
    { method: "eq", args: ["user_id", "user-1"] },
  ])) {
    throw new Error("Activity log filter query changed");
  }
});

Deno.test("preserves the activity log summary query", async () => {
  const { actions, client } = createClient();
  const handlers = createActivityLogHandlers(client as never);

  await operation(handlers, "summary")();

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["action_type"] },
  ])) {
    throw new Error("Activity log summary query changed");
  }
});

Deno.test("preserves the clear logs delete condition", async () => {
  const { actions, client } = createClient();
  const handlers = createActivityLogHandlers(client as never);

  await operation(handlers, "clear")();

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "delete", args: [] },
    { method: "neq", args: ["id", "00000000-0000-0000-0000-000000000000"] },
  ])) {
    throw new Error("Clear logs query changed");
  }
});

Deno.test("preserves the activity log insert query", async () => {
  const { actions, client } = createClient();
  const handlers = createActivityLogHandlers(client as never);
  const payload = { action_type: "login", metadata: {} };

  await operation(handlers, "create")(payload);

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "insert", args: [payload] },
  ])) {
    throw new Error("Activity log insert query changed");
  }
});

Deno.test("preserves action and entity type queries", async () => {
  const { actions, client } = createClient();
  const handlers = createActivityLogHandlers(client as never);

  await operation(handlers, "action-types")();
  await operation(handlers, "entity-types")();

  if (JSON.stringify(actions) !== JSON.stringify([
    { method: "select", args: ["action_type"] },
    { method: "select", args: ["entity_type"] },
  ])) {
    throw new Error("Activity log type queries changed");
  }
});
