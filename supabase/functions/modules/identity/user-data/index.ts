import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { UserDataService } from "./application/UserDataService.ts";
import { SupabaseUserDataRepository } from "./infrastructure/SupabaseUserDataRepository.ts";
import { UserDataController } from "./presentation/UserDataController.ts";

export type UserDataHandler = (input?: unknown) => Promise<unknown>;
export type UserDataRoutes = Record<string, UserDataHandler>;

export function createUserDataModule(client: SupabaseClient): UserDataRoutes {
  const controller = new UserDataController(
    new UserDataService(new SupabaseUserDataRepository(client)),
  );

  return {
    "admin-list": () => controller.adminList(),
    "profiles-get": (input) => controller.profilesGet(input as never),
    "profiles-upsert": (input) => controller.profilesUpsert(input),
    "profiles-update-name": (input) =>
      controller.profilesUpdateName(input as never),
    "roles-get": (input) => controller.rolesGet(input as never),
    "roles-create": (input) => controller.rolesCreate(input as never),
    "roles-delete": (input) => controller.rolesDelete(input as never),
    "roles-replace": (input) => controller.rolesReplace(input as never),
    "permissions-allowed-tabs": () => controller.permissionsAllowedTabs(),
    "users-delete": (input) => controller.usersDelete(input as never),
  };
}
