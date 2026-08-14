import { supabase } from "../client";

export type CreateUserRoleParams = {
  user_id: string;
  role: string;
};

export type UpdateUserRoleParams = {
  user_id: string;
  role: string;
};

export type DeleteUserParams = {
  target_user_id: string;
};

export const usersService = {
  async createUserRole(params: CreateUserRoleParams): Promise<void> {
    const { error } = await supabase.from("user_roles").insert({
      user_id: params.user_id,
      role: params.role,
    });

    if (error) {
      throw error;
    }
  },

  async deleteUserRole(userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  },

  async updateUserRole(params: UpdateUserRoleParams): Promise<void> {
    // First, delete any existing roles for this user
    await supabase.from("user_roles").delete().eq("user_id", params.user_id);

    // Then insert the new role
    const { error } = await supabase.from("user_roles").insert({
      user_id: params.user_id,
      role: params.role,
    });

    if (error) {
      throw error;
    }
  },

  async deleteUser(params: DeleteUserParams): Promise<void> {
    const { error } = await supabase.rpc("delete_user", {
      target_user_id: params.target_user_id,
    });

    if (error) {
      throw error;
    }
  },
};
