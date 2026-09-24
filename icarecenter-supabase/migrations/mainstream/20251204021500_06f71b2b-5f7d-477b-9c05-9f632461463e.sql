-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create ministries table
CREATE TABLE public.ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    leader TEXT,
    meeting_time TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ministries"
ON public.ministries FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage ministries"
ON public.ministries FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TEXT,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage events"
ON public.events FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create service_times table
CREATE TABLE public.service_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    audience TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service times"
ON public.service_times FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage service times"
ON public.service_times FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create church_info table (single row table)
CREATE TABLE public.church_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pastor_name TEXT,
    pastor_email TEXT,
    pastor_phone TEXT,
    church_name TEXT DEFAULT 'I Care Center - Refuge',
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    phone TEXT,
    email TEXT,
    office_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.church_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view church info"
ON public.church_info FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage church info"
ON public.church_info FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default church info
INSERT INTO public.church_info (
    pastor_name, pastor_email, pastor_phone,
    church_name, address, city, state, zip,
    phone, email, office_hours
) VALUES (
    'Pastor Michael', 'pastor@icarerefuge.org', '(555) 123-4567',
    'I Care Center - Refuge', '2057 National Highway, Old Cabalan',
    'Olongapo City', 'Zambales', '2200',
    '(555) 123-4567', 'info@icarerefuge.org',
    'Mon-Fri: 9AM-5PM, Saturday: 9AM-12PM'
);

-- Insert default service times
INSERT INTO public.service_times (name, time, description, audience, sort_order) VALUES
('Sunday Morning Worship', '8:30-10:00 AM', 'Join us for uplifting worship, inspiring music, and biblical teaching that speaks to your heart.', 'All Ages Welcome', 1),
('Friday Evening Bible Study', '6:00 PM', 'Dive deeper into God''s Word with our weekly Bible study. Grow in faith and fellowship.', 'Adults & Teens', 2),
('Children''s Ministry', 'During Services', 'Age-appropriate programs that make learning about Jesus fun and engaging for kids.', 'Ages 0-12', 3),
('Youth Group', 'To Be Announced', 'A dynamic community where teens can connect, grow, and discover their purpose in Christ.', 'Ages 13-22', 4);

-- Insert default ministries
INSERT INTO public.ministries (name, description, leader, meeting_time, image_url, sort_order) VALUES
('Community Outreach', 'Serving our neighbors through food drives, clothing donations, and community service projects.', 'Sarah Johnson', 'Second Saturday of each month', 'https://images.unsplash.com/photo-1631295161934-ec6c829d282a?w=800', 1),
('Care Center', 'Providing counseling, prayer support, and practical assistance to those in need.', 'Pastor Michael', 'Available by appointment', 'https://images.unsplash.com/photo-1485808269728-77bb07c059a8?w=800', 2),
('Worship & Music', 'Using the gift of music to lead our congregation in heartfelt worship and praise.', 'David Wilson', 'Thursdays 7:00 PM', 'https://images.unsplash.com/photo-1565130935995-303a00dad6d8?w=800', 3);

-- Insert default events
INSERT INTO public.events (title, description, event_date, event_time, location) VALUES
('Community Christmas Service', 'Join us for a special Christmas Eve service filled with music, candlelight, and the celebration of Christ''s birth.', '2024-12-23', '7:00 PM', 'Main Sanctuary'),
('New Year Prayer Gathering', 'Start the new year in prayer and fellowship as we seek God''s guidance for the year ahead.', '2024-12-31', '10:00 AM', 'Fellowship Hall'),
('Youth Winter Retreat', 'A weekend of fun, fellowship, and spiritual growth for our youth group. Registration required.', '2025-02-13', 'All Weekend', 'Pine Lake Camp');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_ministries_updated_at
    BEFORE UPDATE ON public.ministries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_times_updated_at
    BEFORE UPDATE ON public.service_times
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_church_info_updated_at
    BEFORE UPDATE ON public.church_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();