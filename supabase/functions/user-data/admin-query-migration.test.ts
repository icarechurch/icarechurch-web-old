const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260814000004_add_admin_users_query.sql",
    import.meta.url,
  ),
);

function assertIncludes(expected: string) {
  if (!migration.includes(expected)) {
    throw new Error(`Expected admin users migration to include: ${expected}`);
  }
}

Deno.test("moves the admin user join into a bounded database read", () => {
  assertIncludes("get_admin_users");
  assertIncludes("public.user_roles");
  assertIncludes("LEFT JOIN LATERAL");
  assertIncludes("ORDER BY profiles.created_at DESC, profiles.id DESC");
  assertIncludes("GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated");
});
