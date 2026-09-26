import { assertEquals } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { CHURCH_INFO_COLUMNS } from "./church-info-columns.ts";
import { SupabaseChurchInfoRepository } from "./SupabaseChurchInfoRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  query.select = (...args: unknown[]) => {
    calls.push(["select", ...args]);
    return query;
  };
  query.maybeSingle = (...args: unknown[]) => {
    calls.push(["maybeSingle", ...args]);
    return query;
  };
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

Deno.test("SupabaseChurchInfoRepository preserves the maybeSingle singleton query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });
  const repository = new SupabaseChurchInfoRepository(client);

  assertEquals(await repository.get(), null);
  assertEquals(calls, [
    ["from", "church_info"],
    ["select", CHURCH_INFO_COLUMNS],
    ["maybeSingle"],
  ]);
});
