-- Create activity_logs table for tracking all application actions
-- This migration is for the LOGGING database (separate Supabase project)
-- Note: This database does NOT have user_roles table, so RLS is simplified

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

-- RLS policies for separate logging database
-- Since this database doesn't have user_roles, admin check is done in the app layer
-- Only authenticated users can interact with logs

-- Authenticated users can view logs (admin check done in app via isAdmin)
CREATE POLICY "Authenticated users can view logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can insert logs
CREATE POLICY "Authenticated users can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Authenticated users can delete logs (admin check done in app via isAdmin)
CREATE POLICY "Authenticated users can delete logs" ON public.activity_logs
  FOR DELETE TO authenticated
  USING (true);
