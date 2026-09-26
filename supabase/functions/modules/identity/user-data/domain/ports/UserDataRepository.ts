export type ProfileInput = {
  userId: string;
};

export type ProfileNameInput = {
  userId: string;
  fullName: string;
};

export type RoleInput = {
  userId: string;
};

export type RoleRecordInput = {
  user_id: string;
  role: string;
};

export type DeleteUserInput = {
  target_user_id: string;
};

export interface UserDataRepository {
  listAdminUsers(): Promise<unknown>;
  getProfile(input: ProfileInput): Promise<unknown>;
  upsertProfile(profile: unknown): Promise<null>;
  updateProfileName(input: ProfileNameInput): Promise<null>;
  getRole(input: RoleInput): Promise<unknown>;
  createRole(input: RoleRecordInput): Promise<null>;
  deleteRole(input: RoleInput): Promise<null>;
  replaceRole(input: RoleRecordInput): Promise<null>;
  getAllowedTabs(): Promise<unknown>;
  deleteUser(input: DeleteUserInput): Promise<null>;
}
