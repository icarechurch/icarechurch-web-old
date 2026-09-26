import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  DeleteUserInput,
  ProfileInput,
  ProfileNameInput,
  RoleInput,
  RoleRecordInput,
  UserDataRepository,
} from "../domain/ports/UserDataRepository.ts";

export class SupabaseUserDataRepository implements UserDataRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listAdminUsers(): Promise<unknown> {
    const { data, error } = await this.client.rpc("get_admin_users", {});

    if (error) throw error;
    return data ?? [];
  }

  async getProfile(input: ProfileInput): Promise<unknown> {
    const { data, error } = await this.client
      .from("profiles")
      .select("full_name")
      .eq("id", input.userId)
      .single();

    if (error) throw error;
    return data;
  }

  async upsertProfile(profile: unknown): Promise<null> {
    const { error } = await this.client
      .from("profiles")
      .upsert(profile as Record<string, unknown>);

    if (error) throw error;
    return null;
  }

  async updateProfileName(input: ProfileNameInput): Promise<null> {
    const { error } = await this.client
      .from("profiles")
      .update({ full_name: input.fullName })
      .eq("id", input.userId);

    if (error) throw error;
    return null;
  }

  async getRole(input: RoleInput): Promise<unknown> {
    const { data, error } = await this.client
      .from("user_roles")
      .select("role")
      .eq("user_id", input.userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.role;
  }

  async createRole(input: RoleRecordInput): Promise<null> {
    const { error } = await this.client.from("user_roles").insert({
      user_id: input.user_id,
      role: input.role,
    });

    if (error) throw error;
    return null;
  }

  async deleteRole(input: RoleInput): Promise<null> {
    const { error } = await this.client
      .from("user_roles")
      .delete()
      .eq("user_id", input.userId);

    if (error) throw error;
    return null;
  }

  async replaceRole(input: RoleRecordInput): Promise<null> {
    await this.client.from("user_roles").delete().eq("user_id", input.user_id);

    const { error } = await this.client.from("user_roles").insert({
      user_id: input.user_id,
      role: input.role,
    });

    if (error) throw error;
    return null;
  }

  async getAllowedTabs(): Promise<unknown> {
    const { data, error } = await this.client.rpc("get_allowed_tabs");

    if (error) throw error;
    return data;
  }

  async deleteUser(input: DeleteUserInput): Promise<null> {
    const { error } = await this.client.rpc("delete_user", {
      target_user_id: input.target_user_id,
    });

    if (error) throw error;
    return null;
  }
}
