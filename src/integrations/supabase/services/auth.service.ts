import { supabase } from "../client";

export type UserRole = "admin" | "moderator" | "user" | null;

export type UserRoleData = {
  role: UserRole;
};

export const authService = {
  async getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.role as UserRole;
  },

  /** Calls the database function `get_allowed_tabs()` to retrieve the list of
   *  admin-dashboard tabs the currently authenticated user may access.
   *  All access decisions are made server-side; the client trusts this result. */
  async getAllowedTabs(): Promise<string[]> {
    const { data, error } = await supabase.rpc("get_allowed_tabs");

    if (error || !data) {
      return ["profile"];
    }

    return data as string[];
  },
};
