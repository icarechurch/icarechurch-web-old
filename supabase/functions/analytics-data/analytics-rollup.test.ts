const migrationPath = new URL(
  "../../migrations/mainstream/20260814000000_add_exact_analytics_rollups.sql",
  import.meta.url,
);

const migration = await Deno.readTextFile(migrationPath);

function assertIncludes(value: string, expected: string) {
  if (!value.includes(expected)) {
    throw new Error(`Expected migration to include: ${expected}`);
  }
}

Deno.test("creates exact analytics key tables and sharded counters", () => {
  assertIncludes(
    migration,
    "CREATE TABLE IF NOT EXISTS public.analytics_unique_visitors",
  );
  assertIncludes(
    migration,
    "CREATE TABLE IF NOT EXISTS public.analytics_daily_unique_visitors",
  );
  assertIncludes(
    migration,
    "CREATE TABLE IF NOT EXISTS public.analytics_tracked_pages",
  );
  assertIncludes(
    migration,
    "CREATE TABLE IF NOT EXISTS public.analytics_counter_shards",
  );
  assertIncludes(migration, "PRIMARY KEY (date, page_path, visitor_id)");
  assertIncludes(migration, "counter_name, shard");
});

Deno.test("backfills exact keys and replaces the scan-heavy analytics trigger", () => {
  assertIncludes(
    migration,
    "INSERT INTO public.analytics_unique_visitors",
  );
  assertIncludes(
    migration,
    "INSERT INTO public.analytics_daily_unique_visitors",
  );
  assertIncludes(migration, "INSERT INTO public.analytics_tracked_pages");
  assertIncludes(
    migration,
    "CREATE OR REPLACE FUNCTION public.update_daily_analytics_stats()",
  );
  assertIncludes(migration, "SET search_path = public");

  const triggerStart = migration.indexOf(
    "CREATE OR REPLACE FUNCTION public.update_daily_analytics_stats()",
  );
  const triggerEnd = migration.indexOf("$$;", triggerStart);
  const trigger = migration.slice(triggerStart, triggerEnd);

  if (/COUNT\s*\(\s*DISTINCT\s+(visitor_id|page_path)/iu.test(trigger)) {
    throw new Error(
      "The analytics trigger migration must not recalculate global distinct counts per visit",
    );
  }
});

Deno.test("keeps null visitor IDs out of exact unique visitor keys", () => {
  const dailyUniqueSection = migration.slice(
    migration.indexOf("INSERT INTO public.analytics_daily_unique_visitors"),
  );

  assertIncludes(dailyUniqueSection, "WHERE visitor_id IS NOT NULL");
});
