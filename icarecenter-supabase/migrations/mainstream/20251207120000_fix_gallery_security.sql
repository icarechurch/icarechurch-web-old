-- Fix Security Vulnerabilities 1.1 and 1.2

-- 1. Fix RLS on gallery_images table
-- Drop insecure policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gallery_images;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.gallery_images;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.gallery_images;

-- Create secure policies (Admin only)
CREATE POLICY "Admins can insert gallery images"
ON public.gallery_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery images"
ON public.gallery_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images"
ON public.gallery_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix Storage Policies for 'gallery' bucket
-- Drop insecure policies
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated updates" ON storage.objects;

-- Create secure policies (Admin only)
CREATE POLICY "Admins can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin') );

CREATE POLICY "Admins can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin') );

CREATE POLICY "Admins can update gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin') );
