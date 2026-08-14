import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createAdminHandlers } from "./admin.ts";
import { createPermissionHandlers } from "./permissions.ts";
import { createProfileHandlers } from "./profiles.ts";
import { createRoleHandlers } from "./roles.ts";
import { createUserHandlers } from "./users.ts";

export function createUserDataHandlers(client: SupabaseClient) {
  return {
    "admin-list": createAdminHandlers(client).list,
    "profile-get": createProfileHandlers(client).get,
    "profile-upsert": createProfileHandlers(client).upsert,
    "profile-update-name": createProfileHandlers(client)["update-name"],
    "role-get": createRoleHandlers(client).get,
    "role-create": createRoleHandlers(client).create,
    "role-delete": createRoleHandlers(client).delete,
    "role-replace": createRoleHandlers(client).replace,
    "allowed-tabs": createPermissionHandlers(client)["allowed-tabs"],
    "user-delete": createUserHandlers(client).delete,
  };
}
