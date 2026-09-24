import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createEventHandlers } from "./events.ts";
import { createEventPopupHandlers } from "./event-popup.ts";
import { createGalleryHandlers } from "./gallery.ts";
import { createGivingHandlers } from "./giving.ts";
import { createMinistryHandlers } from "./ministries.ts";
import { createPastorHandlers } from "./pastors.ts";
import { createSermonHandlers } from "./sermons.ts";
import { createServiceTimeHandlers } from "./service-times.ts";

type QueryResponse = { data: unknown; error: unknown };
type MutationHandlers = Record<
  "create" | "update" | "delete" | "sort" | "upsert",
  (input: unknown) => Promise<unknown>
>;

function mutationHandlers(value: unknown): MutationHandlers {
  return value as MutationHandlers;
}

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  query.insert = (...args: unknown[]) => {
    calls.push(["insert", ...args]);
    return query;
  };
  query.update = (...args: unknown[]) => {
    calls.push(["update", ...args]);
    return query;
  };
  query.delete = (...args: unknown[]) => {
    calls.push(["delete", ...args]);
    return query;
  };
  query.upsert = (...args: unknown[]) => {
    calls.push(["upsert", ...args]);
    return query;
  };
  query.select = (...args: unknown[]) => {
    calls.push(["select", ...args]);
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

Deno.test("preserves the ministry insert query", async () => {
  const ministry = { name: "Care" };
  const { calls, client } = createFakeClient({ data: ministry, error: null });
  await mutationHandlers(createMinistryHandlers(client)).create(ministry);
  assertCalls(calls, [
    ["from", "ministries"],
    ["insert", [ministry]],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the event update query", async () => {
  const updates = { title: "Updated" };
  const { calls, client } = createFakeClient({ data: updates, error: null });
  await mutationHandlers(createEventHandlers(client)).update({
    id: "event-1",
    ...updates,
  });
  assertCalls(calls, [
    ["from", "events"],
    ["update", updates],
    ["eq", "id", "event-1"],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the service time delete query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });
  await mutationHandlers(createServiceTimeHandlers(client)).delete({
    id: "service-time-1",
  });
  assertCalls(calls, [
    ["from", "service_times"],
    ["delete"],
    ["eq", "id", "service-time-1"],
  ]);
});

Deno.test("preserves per-row ministry sort updates", async () => {
  const items = [
    { id: "ministry-1", sort_order: 1 },
    { id: "ministry-2", sort_order: 2 },
  ];
  const { calls, client } = createFakeClient({ data: null, error: null });
  await mutationHandlers(createMinistryHandlers(client)).sort(items);
  assertCalls(calls, [
    ["from", "ministries"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "ministry-1"],
    ["from", "ministries"],
    ["update", { sort_order: 2 }],
    ["eq", "id", "ministry-2"],
  ]);
});

Deno.test("preserves sermon create and delete queries", async () => {
  const sermon = { title: "Hope" };
  const fake = createFakeClient({ data: sermon, error: null });
  const handlers = mutationHandlers(createSermonHandlers(fake.client));
  await handlers.create(sermon);
  await handlers.delete({ id: "sermon-1" });
  assertCalls(fake.calls, [
    ["from", "sermons"],
    ["insert", [sermon]],
    ["select"],
    ["single"],
    ["from", "sermons"],
    ["delete"],
    ["eq", "id", "sermon-1"],
  ]);
});

Deno.test("preserves gallery image insert and delete queries", async () => {
  const image = { title: "Worship" };
  const { calls, client } = createFakeClient({ data: image, error: null });
  const handlers = mutationHandlers(createGalleryHandlers(client));
  await handlers.create(image);
  await handlers.delete({ id: "image-1" });
  assertCalls(calls, [
    ["from", "gallery_images"],
    ["insert", [image]],
    ["select"],
    ["single"],
    ["from", "gallery_images"],
    ["delete"],
    ["eq", "id", "image-1"],
  ]);
});

Deno.test("preserves pastor sort updates", async () => {
  const items = [{ id: "pastor-1", sort_order: 1 }];
  const { calls, client } = createFakeClient({ data: null, error: null });
  await mutationHandlers(createPastorHandlers(client)).sort(items);
  assertCalls(calls, [
    ["from", "pastors"],
    ["update", { sort_order: 1 }],
    ["eq", "id", "pastor-1"],
  ]);
});

Deno.test("preserves event popup upsert options", async () => {
  const settings = { event_id: "event-1", is_enabled: true };
  const { calls, client } = createFakeClient({ data: settings, error: null });
  await mutationHandlers(createEventPopupHandlers(client)).upsert(settings);
  assertCalls(calls, [
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

Deno.test("preserves giving settings update payload", async () => {
  const updates = { donation_platform_name: "Give" };
  const { calls, client } = createFakeClient({ data: null, error: null });
  await mutationHandlers(createGivingHandlers(client)).update({
    id: "giving-1",
    updates,
  });
  assertCalls(calls, [
    ["from", "giving_settings"],
    ["update", updates],
    ["eq", "id", "giving-1"],
  ]);
});
