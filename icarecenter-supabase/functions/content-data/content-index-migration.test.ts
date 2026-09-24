const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260814000003_add_content_query_indexes.sql",
    import.meta.url,
  ),
);

function assertIncludes(expected: string) {
  if (!migration.includes(expected)) {
    throw new Error(`Expected content index migration to include: ${expected}`);
  }
}

Deno.test("indexes every public content ordering key with its stable ID", () => {
  assertIncludes(
    "idx_events_event_date_id",
  );
  assertIncludes(
    "ON public.gallery_images(created_at DESC, id DESC)",
  );
  assertIncludes(
    "ON public.ministries(sort_order ASC, id ASC)",
  );
  assertIncludes(
    "ON public.pastors(sort_order ASC, id ASC)",
  );
  assertIncludes(
    "ON public.sermons(sermon_date DESC, id DESC)",
  );
  assertIncludes(
    "ON public.service_times(sort_order ASC, id ASC)",
  );
});
