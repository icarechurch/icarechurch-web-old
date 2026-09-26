import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { MAX_PUBLIC_CONTENT_ROWS, SERMON_COLUMNS } from "./sermon-columns.ts";
import { SupabaseSermonRepository } from "./SupabaseSermonRepository.ts";

const EXPECTED_SERMON_COLUMNS =
  "id, title, description, speaker, sermon_date, video_url, audio_url, scripture_reference, series_name, thumbnail_url, duration_minutes, is_featured, created_at, updated_at";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  query.delete = (...args: unknown[]) => {
    calls.push(["delete", ...args]);
    return query;
  };
  query.eq = (...args: unknown[]) => {
    calls.push(["eq", ...args]);
    return query;
  };
  query.insert = (...args: unknown[]) => {
    calls.push(["insert", ...args]);
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
  query.order = (...args: unknown[]) => {
    calls.push(["order", ...args]);
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
  query.then = (
    resolve: (value: QueryResponse) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(response).then(resolve, reject);
  query.update = (...args: unknown[]) => {
    calls.push(["update", ...args]);
    return query;
  };

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
      `Expected calls ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

Deno.test("preserves the sermon projection and public row limit", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });

  await new SupabaseSermonRepository(client).list();

  if (SERMON_COLUMNS !== EXPECTED_SERMON_COLUMNS) {
    throw new Error("The sermon projection changed");
  }
  if (MAX_PUBLIC_CONTENT_ROWS !== 100) {
    throw new Error("The public sermon row limit changed");
  }
  assertCalls(calls, [
    ["from", "sermons"],
    ["select", EXPECTED_SERMON_COLUMNS],
    ["order", "sermon_date", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", 100],
  ]);
});

Deno.test("preserves the latest sermon query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });

  await new SupabaseSermonRepository(client).latest();

  assertCalls(calls, [
    ["from", "sermons"],
    ["select", EXPECTED_SERMON_COLUMNS],
    ["order", "sermon_date", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", 1],
    ["maybeSingle"],
  ]);
});

Deno.test("preserves the sermon insert query", async () => {
  const sermon = { title: "Hope" };
  const { calls, client } = createFakeClient({ data: sermon, error: null });

  const result = await new SupabaseSermonRepository(client).create(sermon);

  if (result !== sermon) {
    throw new Error("The inserted sermon result changed");
  }
  assertCalls(calls, [
    ["from", "sermons"],
    ["insert", [sermon]],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the sermon update query", async () => {
  const updates = { title: "Renewed Hope" };
  const input = { id: "sermon-1", ...updates };
  const { calls, client } = createFakeClient({ data: input, error: null });

  const result = await new SupabaseSermonRepository(client).update(input);

  if (result !== input) {
    throw new Error("The updated sermon result changed");
  }
  assertCalls(calls, [
    ["from", "sermons"],
    ["update", updates],
    ["eq", "id", "sermon-1"],
    ["select"],
    ["single"],
  ]);
});

Deno.test("preserves the sermon delete query", async () => {
  const { calls, client } = createFakeClient({ data: null, error: null });

  const result = await new SupabaseSermonRepository(client).delete({
    id: "sermon-1",
  });

  if (result !== "sermon-1") {
    throw new Error("The deleted sermon id changed");
  }
  assertCalls(calls, [
    ["from", "sermons"],
    ["delete"],
    ["eq", "id", "sermon-1"],
  ]);
});

Deno.test("throws Supabase errors unchanged", async () => {
  const databaseError = { code: "42501", message: "permission denied" };
  const { client } = createFakeClient({ data: null, error: databaseError });

  try {
    await new SupabaseSermonRepository(client).list();
  } catch (error) {
    if (error === databaseError) {
      return;
    }
  }

  throw new Error("The Supabase error was not thrown unchanged");
});
