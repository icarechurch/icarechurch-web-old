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

const MINISTRY_COLUMNS =
  "id, name, description, leader, meeting_time, image_url, sort_order, category, created_at, updated_at";
const EVENT_COLUMNS =
  "id, title, description, event_date, event_time, location, image_url, status, created_at, updated_at";
const SERVICE_TIME_COLUMNS =
  "id, name, time, description, audience, sort_order, created_at, updated_at";
const CHURCH_INFO_COLUMNS =
  "id, pastor_name, pastor_email, pastor_phone, church_name, address, city, state, zip, phone, email, office_hours, fallback_stream_url, created_at, updated_at";
const SERMON_COLUMNS =
  "id, title, description, speaker, sermon_date, video_url, audio_url, scripture_reference, series_name, thumbnail_url, duration_minutes, is_featured, created_at, updated_at";
const GALLERY_COLUMNS = "id, title, description, image_url, created_at";
const PASTOR_COLUMNS =
  "id, name, email, phone, title, bio, image_url, facebook_url, sort_order, created_at, updated_at";
const EVENT_POPUP_COLUMNS =
  "id, singleton_key, event_id, is_enabled, created_at, updated_at";
const GIVING_COLUMNS =
  "id, gcash_qr_url, donation_platform_name, donation_platform_url, created_at, updated_at";
const MAX_PUBLIC_CONTENT_ROWS = 100;

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
    ["select", MINISTRY_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves the events list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createEventHandlers(client).list();
  assertCalls(calls, [
    ["from", "events"],
    ["select", EVENT_COLUMNS],
    ["order", "event_date", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves the service times list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createServiceTimeHandlers(client).list();
  assertCalls(calls, [
    ["from", "service_times"],
    ["select", SERVICE_TIME_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves the church info singleton query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });
  await createChurchInfoHandlers(client).get();
  assertCalls(calls, [
    ["from", "church_info"],
    ["select", CHURCH_INFO_COLUMNS],
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
    ["select", SERMON_COLUMNS],
    ["order", "sermon_date", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
    ["from", "sermons"],
    ["select", SERMON_COLUMNS],
    ["order", "sermon_date", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", 1],
    ["maybeSingle"],
  ]);
});

Deno.test("preserves the gallery list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createGalleryHandlers(client).list();
  assertCalls(calls, [
    ["from", "gallery_images"],
    ["select", GALLERY_COLUMNS],
    ["order", "created_at", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("preserves the pastors list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  await createPastorHandlers(client).list();
  assertCalls(calls, [
    ["from", "pastors"],
    ["select", PASTOR_COLUMNS],
    ["order", "sort_order", { ascending: true }],
    ["order", "id", { ascending: true }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
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
    ["select", EVENT_POPUP_COLUMNS],
    ["eq", "singleton_key", true],
    ["single"],
  ]);
});

Deno.test("preserves the giving settings singleton query", async () => {
  const { calls, client } = createFakeClient({ data: {}, error: null });
  await createGivingHandlers(client).get();
  assertCalls(calls, [
    ["from", "giving_settings"],
    ["select", GIVING_COLUMNS],
    ["single"],
  ]);
});
