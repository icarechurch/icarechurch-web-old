export type AdminUserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user";
};

export type CreateUserRoleParams = { user_id: string; role: string };
export type UpdateUserRoleParams = { user_id: string; role: string };
export type DeleteUserParams = { target_user_id: string };
