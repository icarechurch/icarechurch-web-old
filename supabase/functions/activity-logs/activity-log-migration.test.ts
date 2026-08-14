const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260814000002_add_query_performance_indexes.sql",
    import.meta.url,
  ),
);

function assertIncludes(expected: string) {
  if (!migration.includes(expected)) {
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
