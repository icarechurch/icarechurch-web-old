import { UserDataService } from "../application/UserDataService.ts";
import type {
  DeleteUserInput,
  ProfileInput,
  ProfileNameInput,
  RoleInput,
  RoleRecordInput,
} from "../domain/ports/UserDataRepository.ts";

export class UserDataController {
  constructor(private readonly service: UserDataService) {}

  adminList(): Promise<unknown> {
    return this.service.execute("admin-list");
  }

  profilesGet(input: ProfileInput): Promise<unknown> {
    return this.service.execute("profiles-get", input);
  }

  profilesUpsert(profile: unknown): Promise<unknown> {
    return this.service.execute("profiles-upsert", profile);
  }

  profilesUpdateName(input: ProfileNameInput): Promise<unknown> {
    return this.service.execute("profiles-update-name", input);
  }

  rolesGet(input: RoleInput): Promise<unknown> {
    return this.service.execute("roles-get", input);
  }

  rolesCreate(input: RoleRecordInput): Promise<unknown> {
    return this.service.execute("roles-create", input);
  }

  rolesDelete(input: RoleInput): Promise<unknown> {
    return this.service.execute("roles-delete", input);
  }

  rolesReplace(input: RoleRecordInput): Promise<unknown> {
    return this.service.execute("roles-replace", input);
  }

  permissionsAllowedTabs(): Promise<unknown> {
    return this.service.execute("permissions-allowed-tabs");
  }

  usersDelete(input: DeleteUserInput): Promise<unknown> {
    return this.service.execute("users-delete", input);
  }
}
