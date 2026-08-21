CREATE TABLE public.youtube_livestream_status (
  singleton_key BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton_key),
  status TEXT NOT NULL CHECK (status IN ('live', 'offline')),
  video_id TEXT,
  video_title TEXT,
  provider_attempted_at TIMESTAMPTZ,
  refresh_lease_until TIMESTAMPTZ
);

INSERT INTO public.youtube_livestream_status (singleton_key, status)
VALUES (TRUE, 'offline');

ALTER TABLE public.youtube_livestream_status ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.youtube_livestream_status FROM anon, authenticated;
GRANT ALL ON TABLE public.youtube_livestream_status TO service_role;

CREATE OR REPLACE FUNCTION public.claim_youtube_livestream_refresh(
  p_now TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.youtube_livestream_status
  SET
    status = 'offline',
    video_id = NULL,
    video_title = NULL,
    provider_attempted_at = p_now,
    refresh_lease_until = p_now + INTERVAL '1 minute'
  WHERE singleton_key = TRUE
    AND (
      provider_attempted_at IS NULL
      OR provider_attempted_at <= p_now - INTERVAL '10 minutes'
    )
    AND (
      refresh_lease_until IS NULL
      OR refresh_lease_until <= p_now
    );

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_youtube_livestream_refresh(TIMESTAMPTZ)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_youtube_livestream_refresh(TIMESTAMPTZ)
TO service_role;
