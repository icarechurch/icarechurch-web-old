export type CreateUserInput = {
  email: string;
  password: string;
  full_name: string;
  role: string;
};

export type CreatedUser = Record<string, unknown>;

export interface CreateUserRepository {
  getCaller(authHeader: string): Promise<{ id: string } | null>;
  isAdmin(authHeader: string, userId: string): Promise<boolean>;
  createUser(input: CreateUserInput): Promise<CreatedUser | null>;
  assignRole(userId: string, role: string): Promise<void>;
}
