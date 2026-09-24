import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createAdminHandlers } from "./admin.ts";
import { createPermissionHandlers } from "./permissions.ts";
import { createProfileHandlers } from "./profiles.ts";
import { createRoleHandlers } from "./roles.ts";
import { createUserHandlers } from "./users.ts";

export function createUserDataHandlers(client: SupabaseClient) {
  return {
    "admin-list": createAdminHandlers(client).list,
    "profiles-get": createProfileHandlers(client).get,
    "profiles-upsert": createProfileHandlers(client).upsert,
    "profiles-update-name": createProfileHandlers(client)["update-name"],
    "roles-get": createRoleHandlers(client).get,
    "roles-create": createRoleHandlers(client).create,
    "roles-delete": createRoleHandlers(client).delete,
    "roles-replace": createRoleHandlers(client).replace,
    "permissions-allowed-tabs": createPermissionHandlers(client)["allowed-tabs"],
    "users-delete": createUserHandlers(client).delete,
  };
}
