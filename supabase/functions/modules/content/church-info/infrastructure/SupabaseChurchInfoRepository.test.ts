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
  query.update = (...args: unknown[]) => {
    calls.push(["update", ...args]);
    return query;
  };
  query.eq = (...args: unknown[]) => {
    calls.push(["eq", ...args]);
    return query;
  };
  query.single = (...args: unknown[]) => {
    calls.push(["single", ...args]);
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

Deno.test("SupabaseChurchInfoRepository updates by id and returns the updated row", async () => {
  const updatedChurchInfo = { id: "church-1", name: "Updated iCare" };
  const { calls, client } = createFakeClient({
    data: updatedChurchInfo,
    error: null,
  });
  const repository = new SupabaseChurchInfoRepository(client);

  assertEquals(
    await repository.update(updatedChurchInfo),
    updatedChurchInfo,
  );
  assertEquals(calls, [
    ["from", "church_info"],
    ["update", { name: "Updated iCare" }],
    ["eq", "id", "church-1"],
    ["select", CHURCH_INFO_COLUMNS],
    ["single"],
  ]);
});
