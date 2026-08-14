import { invokeFunction } from "../functions";

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
    await invokeFunction<null>("user-data", {
      resource: "roles",
      operation: "create",
      input: params,
    });
  },

  async deleteUserRole(userId: string): Promise<void> {
    await invokeFunction<null>("user-data", {
      resource: "roles",
      operation: "delete",
      input: { userId },
    });
  },

  async updateUserRole(params: UpdateUserRoleParams): Promise<void> {
    await invokeFunction<null>("user-data", {
      resource: "roles",
      operation: "replace",
      input: params,
    });
  },

  async deleteUser(params: DeleteUserParams): Promise<void> {
    await invokeFunction<null>("user-data", {
      resource: "users",
      operation: "delete",
      input: params,
    });
  },
};
