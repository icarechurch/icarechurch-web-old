import { createActivityLogHandlers } from "./queries.ts";
import { HttpError } from "../_shared/errors.ts";

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
    rpc(name: string, args: unknown) {
      actions.push({ method: "rpc", args: [name, args] });
      return Promise.resolve({ data: [], error: null });
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
    {
      method: "select",
      args: [
        "id, action_type, action_description, entity_type, entity_id, user_id, user_email, metadata, ip_address, user_agent, page_path, created_at",
        { count: "exact" },
      ],
    },
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
    { method: "rpc", args: ["get_activity_log_summary", {}] },
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
    { method: "rpc", args: ["get_activity_log_action_types", {}] },
    { method: "rpc", args: ["get_activity_log_entity_types", {}] },
  ])) {
    throw new Error("Activity log type queries changed");
  }
});

Deno.test("rejects activity log pages outside the supported bounds", async () => {
  const { client } = createClient();
  const handler = createActivityLogHandlers(client as never).list;

  try {
    await handler({ limit: 101, offset: 0 });
  } catch (error) {
    if (error instanceof HttpError && error.status === 400) return;
    throw error;
  }

  throw new Error("Expected oversized activity log page to be rejected");
});
