-- Migration: Add activity_logs table to main database
-- Date: 2026-01-16
--
-- This consolidates logging functionality from a separate Supabase project
-- into the main database, fixing cross-project authentication issues.

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,           -- e.g., 'page_visit', 'login', 'create_event'
  action_description TEXT,             -- Human-readable description
  entity_type TEXT,                    -- e.g., 'event', 'ministry', 'sermon'
  entity_id UUID,                      -- ID of the affected entity
  user_id UUID,                        -- User who performed the action (if authenticated)
  user_email TEXT,                     -- Email for easier display
  metadata JSONB DEFAULT '{}',         -- Additional context
  ip_address TEXT,                     -- Client IP (if available)
  user_agent TEXT,                     -- Browser info
  page_path TEXT,                      -- Page where action occurred
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
-- Uses the existing has_role() function from the main database

-- Authenticated users can INSERT logs (for activity tracking)
CREATE POLICY "Authenticated users can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only admins can view logs
CREATE POLICY "Admins can view logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete logs
CREATE POLICY "Admins can delete logs" ON public.activity_logs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Note: UPDATE is intentionally NOT allowed - logs should be immutable
