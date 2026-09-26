-- Update app_role enum to include 'moderator'
-- This is split into its own migration to avoid "unsafe use of new value" (55P04) errors in Supabase
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
