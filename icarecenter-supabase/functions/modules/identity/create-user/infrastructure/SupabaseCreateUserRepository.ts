import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { EnvironmentReader } from "../../../../_shared/infrastructure/supabase/request-client.ts";
import type {
  CreatedUser,
  CreateUserInput,
  CreateUserRepository,
} from "../domain/ports/CreateUserRepository.ts";

function requiredEnvironment(env: EnvironmentReader, name: string): string {
  const value = env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export class SupabaseCreateUserRepository implements CreateUserRepository {
  private readonly url: string;
  private readonly anonKey: string;
  private readonly serviceRoleKey: string;

  constructor(private readonly env: EnvironmentReader = Deno.env) {
    this.url = requiredEnvironment(env, "SUPABASE_URL");
    this.anonKey = requiredEnvironment(env, "SUPABASE_ANON_KEY");
    this.serviceRoleKey = requiredEnvironment(env, "SUPABASE_SERVICE_ROLE_KEY");
  }

  private callerClient(authHeader: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
  }

  private adminClient(): SupabaseClient {
    return createClient(this.url, this.serviceRoleKey);
  }

  async getCaller(authHeader: string): Promise<{ id: string } | null> {
    const {
      data: { user },
      error,
    } = await this.callerClient(authHeader).auth.getUser();

    if (error || !user) return null;
    return { id: user.id };
  }

  async isAdmin(authHeader: string, userId: string): Promise<boolean> {
    const { data } = await this.callerClient(authHeader).from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return Boolean(data);
  }

  async createUser(input: CreateUserInput): Promise<CreatedUser | null> {
    const { data, error } = await this.adminClient().auth.admin.createUser({
      email: input.email,
      password: input.password,
      user_metadata: { full_name: input.full_name },
      email_confirm: true,
    });

    if (error) throw error;
    return (data.user as unknown as CreatedUser | null) ?? null;
  }

  async assignRole(userId: string, role: string): Promise<void> {
    const { error } = await this.adminClient().from("user_roles").insert({
      user_id: userId,
      role,
    });

    if (error) throw error;
  }
}
