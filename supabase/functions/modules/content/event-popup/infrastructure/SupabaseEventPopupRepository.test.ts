import { assertEquals } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { EVENT_POPUP_COLUMNS } from "./event-popup-columns.ts";
import { SupabaseEventPopupRepository } from "./SupabaseEventPopupRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  for (const name of ["eq", "select", "single", "upsert"]) {
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

Deno.test("SupabaseEventPopupRepository preserves its singleton query", async () => {
  const settings = { id: "popup-1" };
  const { calls, client } = createFakeClient({ data: settings, error: null });
  const repository = new SupabaseEventPopupRepository(client);

  assertEquals(await repository.get(), settings);
  assertEquals(calls, [
    ["from", "event_popup_settings"],
    ["select", EVENT_POPUP_COLUMNS],
    ["eq", "singleton_key", true],
    ["single"],
  ]);
});

Deno.test("SupabaseEventPopupRepository returns the disabled fallback for a missing singleton", async () => {
  const { calls, client } = createFakeClient({
    data: null,
    error: { code: "PGRST116" },
  });
  const repository = new SupabaseEventPopupRepository(client);

  assertEquals(await repository.get(), {
    id: "",
    singleton_key: true,
    event_id: null,
    is_enabled: false,
    created_at: "",
    updated_at: "",
  });
  assertEquals(calls, [
    ["from", "event_popup_settings"],
    ["select", EVENT_POPUP_COLUMNS],
    ["eq", "singleton_key", true],
    ["single"],
  ]);
});

Deno.test("SupabaseEventPopupRepository preserves the singleton upsert conflict option", async () => {
  const input = { event_id: "event-1", is_enabled: true };
  const { calls, client } = createFakeClient({ data: input, error: null });
  const repository = new SupabaseEventPopupRepository(client);

  assertEquals(await repository.upsert(input), input);
  assertEquals(calls, [
    ["from", "event_popup_settings"],
    [
      "upsert",
      { singleton_key: true, event_id: "event-1", is_enabled: true },
      { onConflict: "singleton_key" },
    ],
    ["select", "*"],
    ["single"],
  ]);
});
