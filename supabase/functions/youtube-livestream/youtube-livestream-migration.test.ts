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
    "status TEXT NOT NULL CHECK (status IN ('live', 'offline'))",
    "provider_attempted_at TIMESTAMPTZ",
    "refresh_lease_until TIMESTAMPTZ",
    "VALUES (TRUE, 'offline')",
    "ENABLE ROW LEVEL SECURITY",
    "REVOKE ALL ON TABLE public.youtube_livestream_status FROM anon, authenticated",
    "CREATE OR REPLACE FUNCTION public.claim_youtube_livestream_refresh",
    "RETURNS BOOLEAN",
    "SECURITY DEFINER",
    "SET search_path = public",
    "provider_attempted_at <= p_now - INTERVAL '10 minutes'",
    "refresh_lease_until <= p_now",
    "status = 'offline'",
    "provider_attempted_at = p_now",
    "refresh_lease_until = p_now + INTERVAL '1 minute'",
    "RETURN FOUND",
    "GRANT EXECUTE ON FUNCTION public.claim_youtube_livestream_refresh(TIMESTAMPTZ)",
    "TO service_role",
  ]) {
    if (!migration.includes(expected)) {
      throw new Error(`Missing: ${expected}`);
    }
  }
});
