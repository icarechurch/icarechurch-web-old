import { invokeFunction } from "@/infrastructure/supabase/functions";

export type UserRole = "admin" | "moderator" | "user" | null;

export type UserRoleData = {
  role: UserRole;
};

export const authService = {
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      return await invokeFunction<UserRole>("user-data", {
        resource: "roles",
        operation: "get",
        input: { userId },
      });
    } catch (_error) {
      return null;
    }
  },

  /** Calls the database function `get_allowed_tabs()` to retrieve the list of
   *  admin-dashboard tabs the currently authenticated user may access.
   *  All access decisions are made server-side; the client trusts this result. */
  async getAllowedTabs(): Promise<string[]> {
    try {
      return await invokeFunction<string[]>("user-data", {
        resource: "permissions",
        operation: "allowed-tabs",
      });
    } catch (_error) {
      return ["profile"];
    }
  },
};
