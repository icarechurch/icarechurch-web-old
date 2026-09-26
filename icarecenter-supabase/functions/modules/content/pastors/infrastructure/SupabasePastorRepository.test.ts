import { assertEquals } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { MAX_PUBLIC_CONTENT_ROWS, PASTOR_COLUMNS } from "./pastor-columns.ts";
import { SupabasePastorRepository } from "./SupabasePastorRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  for (
    const name of [
      "delete",
      "insert",
      "select",
      "single",
      "limit",
      "order",
      "eq",
      "update",
    ]
  ) {
    query[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return query;
    };
  }
  query.then = (
    resolve: (value: QueryResponse) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(response).then(resolve, reject);

  return {
    calls,
    client: {
      from(table: string) {
        calls.push(["from", table]);
        return query;
      },
    } as unknown as SupabaseClient,
  };
}

Deno.test("SupabasePastorRepository preserves the ordered public list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  const repository = new SupabasePastorRepository(client);

  assertEquals(await repository.list(), []);
  assertEquals(calls, [
    ["from", "pastors"],
    ["select", PASTOR_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("SupabasePastorRepository preserves create update and delete queries", async () => {
  const pastor = { name: "Pastor Ian" };
  const updated = { id: "pastor-1", name: "Pastor Aquino" };
  const { calls, client } = createFakeClient({ data: pastor, error: null });
  const repository = new SupabasePastorRepository(client);

  assertEquals(await repository.create(pastor), pastor);
  assertEquals(await repository.update(updated), pastor);
  assertEquals(await repository.delete({ id: "pastor-1" }), "pastor-1");
  assertEquals(calls, [
    ["from", "pastors"],
    ["insert", [pastor]],
    ["select"],
    ["single"],
    ["from", "pastors"],
    ["update", { name: "Pastor Aquino" }],
    ["eq", "id", "pastor-1"],
    ["select"],
    ["single"],
    ["from", "pastors"],
    ["delete"],
    ["eq", "id", "pastor-1"],
  ]);
});

Deno.test("SupabasePastorRepository preserves one sort update per pastor", async () => {
  const items = [
    { id: "pastor-1", sort_order: 1 },
    { id: "pastor-2", sort_order: 2 },
  ];
  const { calls, client } = createFakeClient({ data: null, error: null });
  const repository = new SupabasePastorRepository(client);

  assertEquals(await repository.sort(items), items);
  assertEquals(calls, [
    ["from", "pastors"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "pastor-1"],
    ["from", "pastors"],
    ["update", { sort_order: 2 }],
    ["eq", "id", "pastor-2"],
  ]);
});
