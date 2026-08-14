import { createUserDataHandlers } from "./queries.ts";

type Action = { table: string; method: string; args: unknown[] };

function createQuery(actions: Action[], table: string, result: unknown) {
  const query = {
    select(...args: unknown[]) {
      actions.push({ table, method: "select", args });
      return query;
    },
    eq(...args: unknown[]) {
      actions.push({ table, method: "eq", args });
      return query;
    },
    maybeSingle(...args: unknown[]) {
      actions.push({ table, method: "maybeSingle", args });
      return Promise.resolve(result);
    },
    single(...args: unknown[]) {
      actions.push({ table, method: "single", args });
      return Promise.resolve(result);
    },
    update(...args: unknown[]) {
      actions.push({ table, method: "update", args });
      return query;
    },
    upsert(...args: unknown[]) {
      actions.push({ table, method: "upsert", args });
      return query;
    },
    insert(...args: unknown[]) {
      actions.push({ table, method: "insert", args });
      return Promise.resolve(result);
    },
    delete() {
      actions.push({ table, method: "delete", args: [] });
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
    from(table: string) {
      return createQuery(actions, table, { data: [], error: null });
    },
    rpc(name: string, args: unknown) {
      actions.push({ table: "rpc", method: name, args: [args] });
      return Promise.resolve({ data: ["profile", "users"], error: null });
    },
  };

  return { actions, client };
}

const operation = (
  handlers: ReturnType<typeof createUserDataHandlers>,
  name: string,
) => handlers[name as keyof typeof handlers] as (...args: unknown[]) => Promise<unknown>;

Deno.test("preserves the admin profile and role queries", async () => {
  const { actions, client } = createClient();
  const handlers = createUserDataHandlers(client as never);

  await operation(handlers, "admin-list")();

  const queryActions = actions.map(({ table, method, args }) => ({ table, method, args }));
  if (JSON.stringify(queryActions) !== JSON.stringify([
    { table: "profiles", method: "select", args: ["*"] },
    { table: "user_roles", method: "select", args: ["*"] },
  ])) {
    throw new Error("Admin user queries changed");
  }
});

Deno.test("preserves profile read and update queries", async () => {
  const { actions, client } = createClient();
  const handlers = createUserDataHandlers(client as never);

  await operation(handlers, "profiles-get")({ userId: "user-1" });
  await operation(handlers, "profiles-upsert")({
    id: "user-1",
    full_name: "Ada",
    updated_at: "2026-01-01T00:00:00.000Z",
  });
  await operation(handlers, "profiles-update-name")({ userId: "user-1", fullName: "Ada" });

  const queryActions = actions.map(({ table, method, args }) => ({ table, method, args }));
  if (JSON.stringify(queryActions) !== JSON.stringify([
    { table: "profiles", method: "select", args: ["full_name"] },
    { table: "profiles", method: "eq", args: ["id", "user-1"] },
    { table: "profiles", method: "single", args: [] },
    { table: "profiles", method: "upsert", args: [{ id: "user-1", full_name: "Ada", updated_at: "2026-01-01T00:00:00.000Z" }] },
    { table: "profiles", method: "update", args: [{ full_name: "Ada" }] },
    { table: "profiles", method: "eq", args: ["id", "user-1"] },
  ])) {
    throw new Error("Profile queries changed");
  }
});

Deno.test("preserves role queries and replacement order", async () => {
  const { actions, client } = createClient();
  const handlers = createUserDataHandlers(client as never);

  await operation(handlers, "roles-get")({ userId: "user-1" });
  await operation(handlers, "roles-create")({ user_id: "user-1", role: "admin" });
  await operation(handlers, "roles-delete")({ userId: "user-1" });
  await operation(handlers, "roles-replace")({ user_id: "user-1", role: "moderator" });

  const queryActions = actions.map(({ table, method, args }) => ({ table, method, args }));
  if (JSON.stringify(queryActions) !== JSON.stringify([
    { table: "user_roles", method: "select", args: ["role"] },
    { table: "user_roles", method: "eq", args: ["user_id", "user-1"] },
    { table: "user_roles", method: "maybeSingle", args: [] },
    { table: "user_roles", method: "insert", args: [{ user_id: "user-1", role: "admin" }] },
    { table: "user_roles", method: "delete", args: [] },
    { table: "user_roles", method: "eq", args: ["user_id", "user-1"] },
    { table: "user_roles", method: "delete", args: [] },
    { table: "user_roles", method: "eq", args: ["user_id", "user-1"] },
    { table: "user_roles", method: "insert", args: [{ user_id: "user-1", role: "moderator" }] },
  ])) {
    throw new Error("Role queries changed");
  }
});

Deno.test("preserves permission and user deletion RPCs", async () => {
  const { actions, client } = createClient();
  const handlers = createUserDataHandlers(client as never);

  await operation(handlers, "permissions-allowed-tabs")();
  await operation(handlers, "users-delete")({ target_user_id: "user-2" });

  if (JSON.stringify(actions) !== JSON.stringify([
    { table: "rpc", method: "get_allowed_tabs", args: [null] },
    { table: "rpc", method: "delete_user", args: [{ target_user_id: "user-2" }] },
  ])) {
    throw new Error("Permission or user deletion RPC changed");
  }
});
