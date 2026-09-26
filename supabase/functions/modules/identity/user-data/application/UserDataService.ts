import type {
  DeleteUserInput,
  ProfileInput,
  ProfileNameInput,
  RoleInput,
  RoleRecordInput,
  UserDataRepository,
} from "../domain/ports/UserDataRepository.ts";

export class UserDataService {
  constructor(private readonly repository: UserDataRepository) {}

  execute(operation: string, input?: unknown): Promise<unknown> {
    switch (operation) {
      case "admin-list":
        return this.repository.listAdminUsers();
      case "profiles-get":
        return this.repository.getProfile(input as ProfileInput);
      case "profiles-upsert":
        return this.repository.upsertProfile(input);
      case "profiles-update-name":
        return this.repository.updateProfileName(input as ProfileNameInput);
      case "roles-get":
        return this.repository.getRole(input as RoleInput);
      case "roles-create":
        return this.repository.createRole(input as RoleRecordInput);
      case "roles-delete":
        return this.repository.deleteRole(input as RoleInput);
      case "roles-replace":
        return this.repository.replaceRole(input as RoleRecordInput);
      case "permissions-allowed-tabs":
        return this.repository.getAllowedTabs();
      case "users-delete":
        return this.repository.deleteUser(input as DeleteUserInput);
      default:
        throw new Error(`Unsupported user data operation: ${operation}`);
    }
  }
}
