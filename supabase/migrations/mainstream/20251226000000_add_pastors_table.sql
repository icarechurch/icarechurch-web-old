-- Create pastors table for multiple pastor support
CREATE TABLE public.pastors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT DEFAULT 'Pastor',
    bio TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pastors ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view pastors"
ON public.pastors FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage pastors"
ON public.pastors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow moderators to manage
CREATE POLICY "Moderators can manage pastors"
ON public.pastors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

-- Create trigger for updated_at
CREATE TRIGGER update_pastors_updated_at
    BEFORE UPDATE ON public.pastors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing pastor data from church_info if exists
INSERT INTO public.pastors (name, email, phone, title, sort_order)
SELECT 
    pastor_name,
    pastor_email,
    pastor_phone,
    'Senior Pastor',
    0
FROM public.church_info
WHERE pastor_name IS NOT NULL AND pastor_name != '';
