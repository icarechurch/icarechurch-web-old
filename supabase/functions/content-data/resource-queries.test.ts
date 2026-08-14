import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createChurchInfoHandlers } from "./church-info.ts";
import { createEventHandlers } from "./events.ts";
import { createEventPopupHandlers } from "./event-popup.ts";
import { createGalleryHandlers } from "./gallery.ts";
import { createGivingHandlers } from "./giving.ts";
import { createMinistryHandlers } from "./ministries.ts";
import { createPastorHandlers } from "./pastors.ts";
import { createSermonHandlers } from "./sermons.ts";
import { createServiceTimeHandlers } from "./service-times.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  query.select = (...args: unknown[]) => {
    calls.push(["select", ...args]);
    return query;
  };
  query.order = (...args: unknown[]) => {
    calls.push(["order", ...args]);
    return query;
  };
  query.limit = (...args: unknown[]) => {
    calls.push(["limit", ...args]);
    return query;
  };
  query.maybeSingle = (...args: unknown[]) => {
    calls.push(["maybeSingle", ...args]);
    return query;
  };
  query.single = (...args: unknown[]) => {
    calls.push(["single", ...args]);
    return query;
  };
  query.eq = (...args: unknown[]) => {
    calls.push(["eq", ...args]);
    return query;
  };
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

function assertCalls(actual: unknown[][], expected: unknown[][]) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected calls ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
}

Deno.test("preserves the ministries list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createMinistryHandlers(client).list();
  assertCalls(calls, [
    ["from", "ministries"],
    ["select", "*"],
    ["order", "sort_order", { ascending: true }],
  ]);
});

Deno.test("preserves the events list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createEventHandlers(client).list();
  assertCalls(calls, [
    ["from", "events"],
    ["select", "*"],
    ["order", "event_date", { ascending: true }],
  ]);
});

Deno.test("preserves the service times list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createServiceTimeHandlers(client).list();
  assertCalls(calls, [
    ["from", "service_times"],
    ["select", "*"],
    ["order", "sort_order", { ascending: true }],
  ]);
});

Deno.test("preserves the church info singleton query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });
  await createChurchInfoHandlers(client).get();
  assertCalls(calls, [
    ["from", "church_info"],
    ["select", "*"],
    ["maybeSingle"],
  ]);
});

Deno.test("preserves both sermon read queries", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  const handlers = createSermonHandlers(client);
  await handlers.list();
  await handlers.latest();
  assertCalls(calls, [
    ["from", "sermons"],
    ["select", "*"],
    ["order", "sermon_date", { ascending: false }],
    ["from", "sermons"],
    ["select", "*"],
    ["order", "sermon_date", { ascending: false }],
    ["limit", 1],
    ["maybeSingle"],
  ]);
});

Deno.test("preserves the gallery list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createGalleryHandlers(client).list();
  assertCalls(calls, [
    ["from", "gallery_images"],
    ["select", "*"],
    ["order", "created_at", { ascending: false }],
  ]);
});

Deno.test("preserves the pastors list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createPastorHandlers(client).list();
  assertCalls(calls, [
    ["from", "pastors"],
    ["select", "*"],
    ["order", "sort_order", { ascending: true }],
  ]);
});

Deno.test("preserves the event popup query and missing-row fallback", async () => {
  const { calls, client } = createFakeClient({
    data: null,
    error: { code: "PGRST116" },
  });
  const result = await createEventPopupHandlers(client).get();

  if (result.id !== "" || result.is_enabled !== false) {
    throw new Error("The event popup fallback changed");
  }

  assertCalls(calls, [
    ["from", "event_popup_settings"],
    ["select", "*"],
    ["eq", "singleton_key", true],
    ["single"],
  ]);
});

Deno.test("preserves the giving settings singleton query", async () => {
  const { calls, client } = createFakeClient({ data: {}, error: null });
  await createGivingHandlers(client).get();
  assertCalls(calls, [
    ["from", "giving_settings"],
    ["select", "*"],
    ["single"],
  ]);
});
