-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name'
    );
    return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users to profiles (safe to run multiple times due to ON CONFLICT or simple INSERT for new table)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- RLS Policy Updates --

-- Update user_roles policies to allow admins to manage everything
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Events: Admins AND Moderators can manage
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins and Moderators can manage events"
    ON public.events FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );

-- Sermons: Admins AND Moderators can manage
DROP POLICY IF EXISTS "Admins can manage sermons" ON public.sermons; 
CREATE POLICY "Admins and Moderators can manage sermons"
    ON public.sermons FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );

-- Ministries: Admins AND Moderators can manage
DROP POLICY IF EXISTS "Admins can manage ministries" ON public.ministries;
CREATE POLICY "Admins and Moderators can manage ministries"
    ON public.ministries FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );

-- Gallery: Admins AND Moderators can manage
DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images; 
CREATE POLICY "Admins and Moderators can manage gallery images"
    ON public.gallery_images FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );

-- Storage Policies for 'church-images' bucket
DROP POLICY IF EXISTS "Admins can upload church images" ON storage.objects;
CREATE POLICY "Admins and Moderators can upload church images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'church-images' AND
        (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    );

DROP POLICY IF EXISTS "Admins can update church images" ON storage.objects;
CREATE POLICY "Admins and Moderators can update church images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'church-images' AND
        (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    );

DROP POLICY IF EXISTS "Admins can delete church images" ON storage.objects;
CREATE POLICY "Admins and Moderators can delete church images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'church-images' AND
        (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    );
