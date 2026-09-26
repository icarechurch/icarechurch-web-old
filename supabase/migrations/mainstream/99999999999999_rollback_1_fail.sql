-- ROLLBACK: Reverse all RBAC changes from migrations 20251206120000 to 20251206230000
-- This will restore the database to its state before RBAC implementation

-- Drop all RLS policies on user_profiles FIRST (before dropping functions)
DROP POLICY IF EXISTS "authenticated_users_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON user_profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON user_profiles;
DROP POLICY IF EXISTS "admins_developers_read_all" ON user_profiles;
DROP POLICY IF EXISTS "Admins and developers can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_developers_insert" ON user_profiles;
DROP POLICY IF EXISTS "Admins and developers can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_developers_update" ON user_profiles;
DROP POLICY IF EXISTS "Admins and developers can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_developers_delete" ON user_profiles;
DROP POLICY IF EXISTS "Admins and developers can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_read_own_profile_simple" ON user_profiles;

-- Drop triggers first (before dropping functions they depend on)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON user_profiles;

-- Drop trigger functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Now drop functions (after policies are gone)
DROP FUNCTION IF EXISTS create_user_invitation(TEXT, TEXT, user_role, TEXT) CASCADE;
DROP FUNCTION IF EXISTS delete_user_account(UUID) CASCADE;
DROP FUNCTION IF EXISTS reset_user_password(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_developer(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_developer(UUID) CASCADE;
DROP FUNCTION IF EXISTS promote_to_developer(TEXT) CASCADE;

-- Drop tables
DROP TABLE IF EXISTS admin_invitations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS user_role CASCADE;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE 'RBAC system has been completely rolled back. Database restored to pre-RBAC state.';
END $$;
