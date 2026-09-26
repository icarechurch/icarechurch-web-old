import { assertEquals } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GIVING_COLUMNS } from "./giving-columns.ts";
import { SupabaseGivingRepository } from "./SupabaseGivingRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  for (const name of ["eq", "select", "single", "update"]) {
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

Deno.test("SupabaseGivingRepository preserves the settings singleton query", async () => {
  const settings = { id: "giving-1" };
  const { calls, client } = createFakeClient({ data: settings, error: null });
  const repository = new SupabaseGivingRepository(client);

  assertEquals(await repository.get(), settings);
  assertEquals(calls, [
    ["from", "giving_settings"],
    ["select", GIVING_COLUMNS],
    ["single"],
  ]);
});

Deno.test("SupabaseGivingRepository preserves the settings update payload", async () => {
  const updates = { donation_platform_name: "Give" };
  const { calls, client } = createFakeClient({ data: null, error: null });
  const repository = new SupabaseGivingRepository(client);

  assertEquals(
    await repository.update({ id: "giving-1", updates }),
    undefined,
  );
  assertEquals(calls, [
    ["from", "giving_settings"],
    ["update", updates],
    ["eq", "id", "giving-1"],
  ]);
});
