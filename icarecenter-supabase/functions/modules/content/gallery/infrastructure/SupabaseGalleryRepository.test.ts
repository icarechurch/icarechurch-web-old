import { assertEquals } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GALLERY_COLUMNS, MAX_PUBLIC_CONTENT_ROWS } from "./gallery-columns.ts";
import { SupabaseGalleryRepository } from "./SupabaseGalleryRepository.ts";

type QueryResponse = { data: unknown; error: unknown };

function createFakeClient(response: QueryResponse) {
  const calls: unknown[][] = [];
  const query: Record<string, unknown> = {};

  for (const name of ["delete", "insert", "select", "single", "limit", "order", "eq"]) {
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

Deno.test("SupabaseGalleryRepository preserves its descending public list query", async () => {
  const { calls, client } = createFakeClient({ data: [], error: null });
  const repository = new SupabaseGalleryRepository(client);

  assertEquals(await repository.list(), []);
  assertEquals(calls, [
    ["from", "gallery_images"],
    ["select", GALLERY_COLUMNS],
    ["order", "created_at", { ascending: false }],
    ["order", "id", { ascending: false }],
    ["limit", MAX_PUBLIC_CONTENT_ROWS],
  ]);
});

Deno.test("SupabaseGalleryRepository preserves image insert and delete queries", async () => {
  const image = { title: "Worship" };
  const { calls, client } = createFakeClient({ data: image, error: null });
  const repository = new SupabaseGalleryRepository(client);

  assertEquals(await repository.create(image), image);
  assertEquals(await repository.delete({ id: "image-1" }), "image-1");
  assertEquals(calls, [
    ["from", "gallery_images"],
    ["insert", [image]],
    ["select"],
    ["single"],
    ["from", "gallery_images"],
    ["delete"],
    ["eq", "id", "image-1"],
  ]);
});
