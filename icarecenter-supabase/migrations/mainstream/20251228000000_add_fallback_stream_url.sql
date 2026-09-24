-- Add fallback_stream_url column to church_info table
-- This allows admins to set a backup stream link for when automatic detection fails

ALTER TABLE church_info 
ADD COLUMN IF NOT EXISTS fallback_stream_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN church_info.fallback_stream_url IS 'Fallback Facebook video URL used when automatic stream detection fails';
