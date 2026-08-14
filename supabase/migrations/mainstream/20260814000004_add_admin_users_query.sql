-- Keep the admin users screen on one database-side join.

CREATE INDEX IF NOT EXISTS idx_profiles_created_at_id
  ON public.profiles(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_created_at
  ON public.user_roles(user_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  role public.app_role
)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT
    profiles.id,
    profiles.email,
    profiles.full_name,
    profiles.created_at,
    COALESCE(roles.role, 'user'::public.app_role)
  FROM public.profiles
  LEFT JOIN LATERAL (
    SELECT user_roles.role
    FROM public.user_roles
    WHERE user_roles.user_id = profiles.id
    ORDER BY user_roles.created_at DESC, user_roles.id DESC
    LIMIT 1
  ) AS roles ON TRUE
  ORDER BY profiles.created_at DESC, profiles.id DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
