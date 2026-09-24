-- Create sermons table
CREATE TABLE public.sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    speaker TEXT NOT NULL,
    sermon_date DATE NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    scripture_reference TEXT,
    series_name TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sermons
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Create policies for sermons
CREATE POLICY "Anyone can view sermons"
ON public.sermons FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage sermons"
ON public.sermons FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_sermons_updated_at
    BEFORE UPDATE ON public.sermons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample sermon data
INSERT INTO public.sermons (
    title, 
    description, 
    speaker, 
    sermon_date, 
    scripture_reference, 
    series_name,
    duration_minutes,
    is_featured
) VALUES (
    'Walking in Faith',
    'Discover what it truly means to walk by faith and not by sight. Learn how to trust God even when the path ahead seems unclear.',
    'Pastor Michael',
    '2024-11-24',
    'Hebrews 11:1-6',
    'Faith Series',
    45,
    true
), (
    'The Power of Prayer',
    'Explore the transformative power of prayer and how it can change not only our circumstances but our hearts.',
    'Pastor Michael',
    '2024-11-17',
    'Matthew 6:5-15',
    'Faith Series',
    42,
    false
), (
    'Love in Action',
    'Learn how to put love into practice in our daily lives and show Christ''s love to those around us.',
    'Pastor Michael',
    '2024-11-10',
    '1 John 3:16-18',
    'Living Christ-Like',
    38,
    false
);