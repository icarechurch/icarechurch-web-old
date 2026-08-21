const migration = await Deno.readTextFile(
  new URL(
    "../../migrations/mainstream/20260819000000_add_youtube_livestream_status.sql",
    import.meta.url,
  ),
);

Deno.test("protects the singleton livestream cache", () => {
  for (const expected of [
    "CREATE TABLE public.youtube_livestream_status",
    "CHECK (singleton_key)",
    "ENABLE ROW LEVEL SECURITY",
    "REVOKE ALL ON TABLE public.youtube_livestream_status FROM anon, authenticated",
  ]) {
    if (!migration.includes(expected)) {
      throw new Error(`Missing: ${expected}`);
    }
  }
});
