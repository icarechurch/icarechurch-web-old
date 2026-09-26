-- Fix storage policies for 'gallery' bucket to allow moderators
-- Previous migration only updated 'church-images' bucket, but gallery uses 'gallery' bucket

-- Drop old admin-only policies
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;

-- Recreate with admin OR moderator access
CREATE POLICY "Admins and Moderators can upload to gallery bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'gallery' AND 
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admins and Moderators can delete from gallery bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'gallery' AND 
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admins and Moderators can update gallery bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'gallery' AND 
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);
