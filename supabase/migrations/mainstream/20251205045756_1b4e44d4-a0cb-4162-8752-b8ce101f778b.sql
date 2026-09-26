-- Create storage bucket for church images
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-images', 'church-images', true);

-- Allow anyone to view images
CREATE POLICY "Anyone can view church images"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload church images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update church images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete church images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'church-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);