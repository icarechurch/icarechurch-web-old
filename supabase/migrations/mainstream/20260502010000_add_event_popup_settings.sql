-- Create singleton table for homepage event popup settings
CREATE TABLE IF NOT EXISTS public.event_popup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_required_when_enabled CHECK (NOT is_enabled OR event_id IS NOT NULL)
);

-- Ensure one settings row exists
INSERT INTO public.event_popup_settings (singleton_key, is_enabled)
VALUES (TRUE, FALSE)
ON CONFLICT (singleton_key) DO NOTHING;

-- Keep updated_at fresh on updates
DROP TRIGGER IF EXISTS update_event_popup_settings_updated_at ON public.event_popup_settings;
CREATE TRIGGER update_event_popup_settings_updated_at
  BEFORE UPDATE ON public.event_popup_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.event_popup_settings ENABLE ROW LEVEL SECURITY;

-- Public can read popup settings for website display
DROP POLICY IF EXISTS "Anyone can view event popup settings" ON public.event_popup_settings;
CREATE POLICY "Anyone can view event popup settings"
  ON public.event_popup_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admins and moderators can create/repair the singleton row
DROP POLICY IF EXISTS "Admins and Moderators can insert event popup settings" ON public.event_popup_settings;
CREATE POLICY "Admins and Moderators can insert event popup settings"
  ON public.event_popup_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Admins and moderators can update popup settings
DROP POLICY IF EXISTS "Admins and Moderators can update event popup settings" ON public.event_popup_settings;
CREATE POLICY "Admins and Moderators can update event popup settings"
  ON public.event_popup_settings
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );
