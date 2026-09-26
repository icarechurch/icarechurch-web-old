const migrationUrl = new URL(
  "./20260926000000_set_public_church_email.sql",
  import.meta.url,
);

Deno.test("updates only the known public church email placeholders", async () => {
  const sql = await Deno.readTextFile(migrationUrl);
  const normalized = sql.toLowerCase();

  for (
    const expected of [
      "icarecenter.media@gmail.com",
      "update public.church_info",
      "pastor@icarerefuge.org",
      "update public.pastors",
    ]
  ) {
    if (!normalized.includes(expected)) {
      throw new Error(`Migration is missing expected fragment: ${expected}`);
    }
  }

  if (
    normalized.includes("update public.pastors set email =") &&
    !normalized.includes("where email = 'pastor@icarerefuge.org'")
  ) {
    throw new Error(
      "Pastor emails must be restricted to the legacy placeholder",
    );
  }
});
