-- Returns the list of admin dashboard tabs the calling user is permitted to access.
-- Centralises tab-level authorisation on the database so the client cannot tamper with it.
CREATE OR REPLACE FUNCTION public.get_allowed_tabs()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
    THEN ARRAY[
      'analytics',
      'ministries',
      'events',
      'sermons',
      'services',
      'church-info',
      'gallery',
      'giving',
      'users',
      'logs',
      'profile'
    ]
    ELSE ARRAY['profile']::TEXT[]
  END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.get_allowed_tabs() TO authenticated;
