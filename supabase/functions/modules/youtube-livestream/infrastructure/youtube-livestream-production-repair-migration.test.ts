const migration = await Deno.readTextFile(
  new URL(
    "../../../../migrations/20261004000000_repair_youtube_livestream_status.sql",
    import.meta.url,
  ),
);

Deno.test("repairs the production livestream cache idempotently", () => {
  for (
    const expected of [
      "CREATE TABLE IF NOT EXISTS public.youtube_livestream_status",
      "INSERT INTO public.youtube_livestream_status (singleton_key, status)",
      "ON CONFLICT (singleton_key) DO NOTHING",
      "CREATE OR REPLACE FUNCTION public.claim_youtube_livestream_refresh",
      "GRANT EXECUTE ON FUNCTION public.claim_youtube_livestream_refresh(TIMESTAMPTZ)",
    ]
  ) {
    if (!migration.includes(expected)) {
      throw new Error(`Missing: ${expected}`);
    }
  }
});
