import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { SupabaseMinistryRepository } from "./SupabaseMinistryRepository.ts";

const MINISTRY_COLUMNS =
  "id, name, description, leader, meeting_time, image_url, sort_order, category, created_at, updated_at";
const MAX_PUBLIC_CONTENT_ROWS = 100;

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(responses: QueryResponse[]) {
  const calls: unknown[][] = [];
  let responseIndex = 0;
  const query: Record<string, unknown> = {};

  for (
    const method of [
      "select",
      "order",
      "limit",
      "insert",
      "update",
      "delete",
      "eq",
      "single",
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
  ) => {
    const response = responses[responseIndex++];
    return Promise.resolve(response).then(resolve, reject);
  };

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

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

Deno.test("preserves the ministries list query", async () => {
  const { calls, client } = createFakeClient([{ data: [], error: null }]);

  assertEquals(await new SupabaseMinistryRepository(client).list(), []);
  assertCalls(calls, [
    ["from", "ministries"],
    ["select", MINISTRY_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves ministry create, update, and delete queries", async () => {
  const ministry = { name: "Care" };
  const updates = { name: "Community Care" };
  const { calls, client } = createFakeClient([
    { data: ministry, error: null },
    { data: updates, error: null },
    { data: null, error: null },
  ]);
  const repository = new SupabaseMinistryRepository(client);

  assertEquals(await repository.create(ministry), ministry);
  assertEquals(
    await repository.update({ id: "ministry-1", ...updates }),
    updates,
  );
  assertEquals(await repository.delete({ id: "ministry-1" }), "ministry-1");
  assertCalls(calls, [
    ["from", "ministries"],
    ["insert", [ministry]],
    ["select"],
    ["single"],
    ["from", "ministries"],
    ["update", updates],
    ["eq", "id", "ministry-1"],
    ["select"],
    ["single"],
    ["from", "ministries"],
    ["delete"],
    ["eq", "id", "ministry-1"],
  ]);
});

Deno.test("sorts ministries with sequential per-row updates", async () => {
  const items = [
    { id: "ministry-1", sort_order: 1 },
    { id: "ministry-2", sort_order: 2 },
  ];
  const { calls, client } = createFakeClient([
    { data: null, error: null },
    { data: null, error: null },
  ]);

  assertEquals(await new SupabaseMinistryRepository(client).sort(items), items);
  assertCalls(calls, [
    ["from", "ministries"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "ministry-1"],
    ["from", "ministries"],
    ["update", { sort_order: 2 }],
    ["eq", "id", "ministry-2"],
  ]);
});

Deno.test("stops ministry sorting after the first failed row update", async () => {
  const error = new Error("sort failed");
  const { calls, client } = createFakeClient([{ data: null, error }]);

  let received: unknown;
  try {
    await new SupabaseMinistryRepository(client).sort([
      { id: "ministry-1", sort_order: 1 },
      { id: "ministry-2", sort_order: 2 },
    ]);
  } catch (caught) {
    received = caught;
  }

  assertEquals(received, error);
  assertCalls(calls, [
    ["from", "ministries"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "ministry-1"],
  ]);
});
