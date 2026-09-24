-- Fix Low Risk Vulnerability 3.1: Server-Side MIME Type Validation

-- Drop the existing policy to recreate it with stricter checks
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;

-- Recreate policy with MIME type check
CREATE POLICY "Admins can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' 
  AND public.has_role(auth.uid(), 'admin')
  AND (
     -- Allow standard image types
     metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  )
);
