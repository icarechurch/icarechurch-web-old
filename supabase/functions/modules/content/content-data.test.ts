import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError } from "../../_shared/errors.ts";
import {
  type ContentRoutes,
  createContentModule,
} from "./index.ts";
import { dispatchContentRequest } from "./entrypoint.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse): SupabaseClient {
  const query: Record<string, unknown> = {};
  const queryMethods = [
    "delete",
    "eq",
    "insert",
    "limit",
    "maybeSingle",
    "order",
    "select",
    "single",
    "update",
    "upsert",
  ];

  for (const method of queryMethods) {
    query[method] = (..._args: unknown[]) => query;
  }

  query.then = (
    resolve: (value: QueryResponse) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(response).then(resolve, reject);

  return {
    from: () => query,
  } as unknown as SupabaseClient;
}

function assertReachable(routes: ContentRoutes): Promise<unknown>[] {
  return [
    routes.ministries.list(undefined),
    routes.ministries.create({ name: "Care" }),
    routes.ministries.update({ id: "ministry-1", name: "Care" }),
    routes.ministries.delete({ id: "ministry-1" }),
    routes.ministries.sort([{ id: "ministry-1", sort_order: 1 }]),
    routes.events.list(undefined),
    routes.events.create({ title: "Gathering" }),
    routes.events.update({ id: "event-1", title: "Gathering" }),
    routes.events.delete({ id: "event-1" }),
    routes["service-times"].list(undefined),
    routes["service-times"].create({ name: "Sunday Worship" }),
    routes["service-times"].update({ id: "service-time-1", name: "Worship" }),
    routes["service-times"].delete({ id: "service-time-1" }),
    routes["service-times"].sort([{ id: "service-time-1", sort_order: 1 }]),
    routes["church-info"].get(undefined),
    routes.sermons.list(undefined),
    routes.sermons.latest(undefined),
    routes.sermons.create({ title: "Hope" }),
    routes.sermons.update({ id: "sermon-1", title: "Hope" }),
    routes.sermons.delete({ id: "sermon-1" }),
    routes.gallery.list(undefined),
    routes.gallery.create({ title: "Worship" }),
    routes.gallery.delete({ id: "image-1" }),
    routes.pastors.list(undefined),
    routes.pastors.create({ name: "Pastor" }),
    routes.pastors.update({ id: "pastor-1", name: "Pastor" }),
    routes.pastors.delete({ id: "pastor-1" }),
    routes.pastors.sort([{ id: "pastor-1", sort_order: 1 }]),
    routes["event-popup"].get(undefined),
    routes["event-popup"].upsert({ event_id: "event-1", is_enabled: true }),
    routes.giving.get(undefined),
    routes.giving.update({
      id: "giving-1",
      updates: { donation_platform_name: "Give" },
    }),
  ];
}

Deno.test("exposes every deployed content operation through the module", async () => {
  const routes = createContentModule(
    createFakeClient({ data: null, error: null }),
  );

  await Promise.all(assertReachable(routes));
});

Deno.test("dispatches a content route through the public module surface", async () => {
  const routes = createContentModule(
    createFakeClient({ data: [{ id: "event-1" }], error: null }),
  );
  const result = await dispatchContentRequest(
    { resource: "events", operation: "list" },
    routes,
  );

  if (!Array.isArray(result)) {
    throw new Error("The events list route was not dispatched");
  }
});

Deno.test("rejects an unknown content operation", async () => {
  try {
    await dispatchContentRequest(
      { resource: "unknown", operation: "list" },
      {},
    );
  } catch (error) {
    if (
      !(error instanceof HttpError) ||
      error.code !== "INVALID_OPERATION" ||
      error.status !== 400
    ) {
      throw new Error("Unexpected error for an unknown operation");
    }
    return;
  }

  throw new Error("Expected an unknown operation to be rejected");
});

Deno.test("keeps the adapter free of private resource-handler imports", async () => {
  const source = await Deno.readTextFile(
    new URL("./entrypoint.ts", import.meta.url),
  );
  if (
    /\.\/((sermons|events|ministries|church-info|gallery|pastors|service-times|giving|event-popup)\.ts)/
      .test(
        source,
      )
  ) {
    throw new Error("The content adapter imports a private resource handler");
  }
});
