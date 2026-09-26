import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { EVENT_COLUMNS, MAX_PUBLIC_CONTENT_ROWS } from "./event-columns.ts";
import { SupabaseEventRepository } from "./SupabaseEventRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  for (
    const method of [
      "delete",
      "eq",
      "insert",
      "limit",
      "order",
      "select",
      "single",
      "update",
    ]
  ) {
    query[method] = (...args: unknown[]) => {
      calls.push([method, ...args]);
      return query;
    };
  }

  query.then = (
    resolve: (value: QueryResponse) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(response).then(resolve, reject);

  const client = {
    from(table: string) {
      calls.push(["from", table]);
      return query;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
}

function assertCalls(actual: unknown[][], expected: unknown[][]): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected calls ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

async function assertThrowsSameError(
  operation: () => Promise<unknown>,
  expected: unknown,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (error === expected) {
      return;
    }

    throw new Error("The repository did not preserve the Supabase error");
  }

  throw new Error("The repository did not throw the Supabase error");
}

Deno.test("preserves the events list query and result", async () => {
  const events = [{ id: "event-1" }];
  const { calls, client } = createFakeClient({ data: events, error: null });

  const result = await new SupabaseEventRepository(client).list();

  if (result !== events) {
    throw new Error("The events list result changed");
  }

  assertCalls(calls, [
    ["from", "events"],
    ["select", EVENT_COLUMNS],
    ["order", "event_date", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves the events insert query and result", async () => {
  const event = { title: "Prayer Night" };
  const { calls, client } = createFakeClient({ data: event, error: null });

  const result = await new SupabaseEventRepository(client).create(event);

  if (result !== event) {
    throw new Error("The events insert result changed");
  }

  assertCalls(calls, [
    ["from", "events"],
    ["insert", [event]],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the events update query and result", async () => {
  const updates = { title: "Updated Prayer Night" };
  const { calls, client } = createFakeClient({ data: updates, error: null });

  const result = await new SupabaseEventRepository(client).update({
    id: "event-1",
    ...updates,
  });

  if (result !== updates) {
    throw new Error("The events update result changed");
  }

  assertCalls(calls, [
    ["from", "events"],
    ["update", updates],
    ["eq", "id", "event-1"],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the events delete query and deleted ID", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });

  const result = await new SupabaseEventRepository(client).delete({
    id: "event-1",
  });

  if (result !== "event-1") {
    throw new Error("The deleted event ID changed");
  }

  assertCalls(calls, [
    ["from", "events"],
    ["delete"],
    ["eq", "id", "event-1"],
  ]);
});

Deno.test("propagates Supabase errors from each events operation", async () => {
  const error = new Error("Database unavailable");
  const list = createFakeClient({ data: null, error });
  const create = createFakeClient({ data: null, error });
  const update = createFakeClient({ data: null, error });
  const remove = createFakeClient({ data: null, error });

  await assertThrowsSameError(
    () => new SupabaseEventRepository(list.client).list(),
    error,
  );
  await assertThrowsSameError(
    () => new SupabaseEventRepository(create.client).create({}),
    error,
  );
  await assertThrowsSameError(
    () => new SupabaseEventRepository(update.client).update({ id: "event-1" }),
    error,
  );
  await assertThrowsSameError(
    () => new SupabaseEventRepository(remove.client).delete({ id: "event-1" }),
    error,
  );
});
