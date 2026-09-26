import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { SupabaseServiceTimeRepository } from "./SupabaseServiceTimeRepository.ts";

const SERVICE_TIME_COLUMNS =
  "id, name, time, description, audience, sort_order, created_at, updated_at";

type QueryResponse = { data: unknown; error: unknown };
type DeferredResponse = {
  promise: Promise<QueryResponse>;
  resolve: (response: QueryResponse) => void;
};

function createDeferredResponse(): DeferredResponse {
  let resolveResponse: ((response: QueryResponse) => void) | undefined;
  const promise = new Promise<QueryResponse>((resolve) => {
    resolveResponse = resolve;
  });

  return {
    promise,
    resolve(response: QueryResponse): void {
      resolveResponse?.(response);
    },
  };
}

function createFakeClient(responses: QueryResponse[]) {
  const calls: unknown[][] = [];
  let responseIndex = 0;

  const client = {
    from(table: string) {
      calls.push(["from", table]);
      const response = responses[responseIndex++];
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
      ) => Promise.resolve(response).then(resolve, reject);

      return query;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
}

function createSequentialFakeClient(deferredResponses: DeferredResponse[]) {
  const calls: unknown[][] = [];
  let responseIndex = 0;

  const client = {
    from(table: string) {
      calls.push(["from", table]);
      const response = deferredResponses[responseIndex++];
      const query: Record<string, unknown> = {};

      query.update = (...args: unknown[]) => {
        calls.push(["update", ...args]);
        return query;
      };
      query.eq = (...args: unknown[]) => {
        calls.push(["eq", ...args]);
        return query;
      };
      query.then = (
        resolve: (value: QueryResponse) => unknown,
        reject: (reason: unknown) => unknown,
      ) => response.promise.then(resolve, reject);

      return query;
    },
  } as unknown as SupabaseClient;

  return { calls, client };
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

async function waitForCallCount(
  calls: unknown[][],
  count: number,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (calls.length === count) return;
    await Promise.resolve();
  }

  throw new Error(`Expected ${count} calls, received ${calls.length}`);
}

Deno.test("preserves the service-times list projection, ordering, and limit", async () => {
  const { calls, client } = createFakeClient([{ data: [], error: null }]);

  const result = await new SupabaseServiceTimeRepository(client).list();

  assertEquals(result, []);
  assertEquals(calls, [
    ["from", "service_times"],
    ["select", SERVICE_TIME_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", 100],
  ]);
});

Deno.test("preserves service-time create, update, and delete payloads", async () => {
  const serviceTime = { name: "Sunday Worship", time: "09:00" };
  const updates = { name: "Sunday Celebration" };
  const { calls, client } = createFakeClient([
    { data: serviceTime, error: null },
    { data: updates, error: null },
    { data: null, error: null },
  ]);
  const repository = new SupabaseServiceTimeRepository(client);

  assertEquals(await repository.create(serviceTime), serviceTime);
  assertEquals(
    await repository.update({ id: "service-time-1", ...updates }),
    updates,
  );
  assertEquals(
    await repository.delete({ id: "service-time-1" }),
    "service-time-1",
  );
  assertEquals(calls, [
    ["from", "service_times"],
    ["insert", [serviceTime]],
    ["select"],
    ["single"],
    ["from", "service_times"],
    ["update", updates],
    ["eq", "id", "service-time-1"],
    ["select"],
    ["single"],
    ["from", "service_times"],
    ["delete"],
    ["eq", "id", "service-time-1"],
  ]);
});

Deno.test("updates service-time sort rows sequentially", async () => {
  const first = createDeferredResponse();
  const second = createDeferredResponse();
  const { calls, client } = createSequentialFakeClient([first, second]);
  const items = [
    { id: "service-time-2", sort_order: 1 },
    { id: "service-time-1", sort_order: 2 },
  ];
  const sort = new SupabaseServiceTimeRepository(client).sort(items);

  assertEquals(calls, [
    ["from", "service_times"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "service-time-2"],
  ]);

  first.resolve({ data: null, error: null });
  await waitForCallCount(calls, 6);

  assertEquals(calls, [
    ["from", "service_times"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "service-time-2"],
    ["from", "service_times"],
    ["update", { sort_order: 2 }],
    ["eq", "id", "service-time-1"],
  ]);

  second.resolve({ data: null, error: null });

  assertEquals(await sort, items);
});
