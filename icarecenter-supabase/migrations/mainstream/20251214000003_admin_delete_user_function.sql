-- Function to allow admins to delete users
-- This must be a SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the executing user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete users.';
  END IF;

  -- Delete the user from auth.users (cascades to profiles, user_roles, etc due to FK)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
