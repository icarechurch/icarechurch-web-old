const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260814000002_add_query_performance_indexes.sql",
    import.meta.url,
  ),
);
const rollupMigration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260814000005_add_exact_activity_log_rollups.sql",
    import.meta.url,
  ),
);

function assertIncludes(expected: string, source = migration) {
  if (!source.includes(expected)) {
    throw new Error(`Expected activity log migration to include: ${expected}`);
  }
}

Deno.test("adds indexes for activity log filters and ordering", () => {
  assertIncludes("idx_activity_logs_created_at_action_type");
  assertIncludes("idx_activity_logs_created_at_entity_type");
  assertIncludes("idx_activity_logs_created_at_user_id");
});

Deno.test("moves activity log reductions into database functions", () => {
  assertIncludes("get_activity_log_summary");
  assertIncludes("get_activity_log_action_types");
  assertIncludes("get_activity_log_entity_types");
  assertIncludes("SELECT DISTINCT logs.action_type");
  assertIncludes("SELECT DISTINCT logs.entity_type");
});

Deno.test("maintains exact activity log rollups without summary table scans", () => {
  assertIncludes("activity_log_action_counts", rollupMigration);
  assertIncludes("activity_log_entity_counts", rollupMigration);
  assertIncludes("activity_log_totals", rollupMigration);
  assertIncludes("update_activity_log_rollups", rollupMigration);
  assertIncludes("CREATE TRIGGER activity_log_rollups", rollupMigration);
  assertIncludes("FROM public.activity_log_action_counts", rollupMigration);
  assertIncludes("FROM public.activity_log_entity_counts", rollupMigration);
});
