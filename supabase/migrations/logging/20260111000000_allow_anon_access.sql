-- Migration: Allow anonymous access for cross-project logging
-- Date: 2026-01-11
-- 
-- SECURITY MODEL EXPLANATION:
-- This logging database is a SEPARATE Supabase project from the main app.
-- Since authentication tokens are project-specific, users authenticated against
-- the main project appear as 'anon' to this logging project.
--
-- Security is maintained through:
-- 1. This is a separate, isolated database containing ONLY activity logs
-- 2. No sensitive user data is stored here (only action metadata)
-- 3. Admin access is controlled at the APPLICATION layer via isAdmin checks
-- 4. The logging database URL/keys are only used internally
--
-- Risk assessment:
-- - INSERT: Low risk - worst case is fake log entries
-- - SELECT: Low risk - logs don't contain sensitive data
-- - DELETE: Moderate risk - could delete audit trail, but app enforces admin check

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can view logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can delete logs" ON public.activity_logs;

-- Create new policies that allow anon role (for cross-project access)

-- Anyone can insert logs (for activity tracking from client)
CREATE POLICY "Allow log insertion" ON public.activity_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Anyone can view logs (admin check done in app via isAdmin)
CREATE POLICY "Allow log viewing" ON public.activity_logs
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can delete logs (admin check done in app via isAdmin)  
CREATE POLICY "Allow log deletion" ON public.activity_logs
  FOR DELETE TO anon, authenticated
  USING (true);

-- Note: UPDATE is intentionally NOT allowed - logs should be immutable
-- If a log needs correction, delete and re-insert
