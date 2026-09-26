-- Migration: Fix HIGH-1 RLS policy gaps
-- Date: 2026-03-15
--
-- Three issues addressed:
--
-- 1. giving_settings UPDATE was open to any authenticated user (USING (true)).
--    Any user with the anon key could change the donation URL directly via the API.
--
-- 2. The MIME type allowlist for the gallery storage bucket was accidentally dropped
--    by 20251221000000 when it added moderator access. Any file type could be
--    uploaded by admin/moderator users after that migration.
--
-- 3. analytics_overall_stats SELECT excluded moderators even though the two sibling
--    analytics tables were updated by 20251219160000 to include them.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. giving_settings: restrict UPDATE to admins only
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to update giving settings" ON public.giving_settings;

CREATE POLICY "Admins can update giving settings"
  ON public.giving_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. gallery storage: re-add MIME type allowlist to the upload policy
--    (dropped in 20251221000000 when moderator access was added)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins and Moderators can upload to gallery bucket" ON storage.objects;

CREATE POLICY "Admins and Moderators can upload to gallery bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    AND metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. analytics_overall_stats: extend SELECT to moderators
--    (20251219160000 updated the two sibling tables but missed this one)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Only admins can read analytics_overall_stats" ON public.analytics_overall_stats;

CREATE POLICY "Admins and Moderators can read analytics_overall_stats"
  ON public.analytics_overall_stats
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );
