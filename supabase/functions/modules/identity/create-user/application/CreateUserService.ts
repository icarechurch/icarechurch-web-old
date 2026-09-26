import { HttpError } from "../../../../_shared/errors.ts";
import type {
  CreatedUser,
  CreateUserInput,
  CreateUserRepository,
} from "../domain/ports/CreateUserRepository.ts";

export type CreateUserResult = {
  status: number;
  body: { user: CreatedUser | null; warning?: string };
};

function parseInput(input: unknown): CreateUserInput {
  if (!input || typeof input !== "object") {
    throw new HttpError(400, "INVALID_REQUEST", "Invalid request body");
  }

  const value = input as Record<string, unknown>;
  if (
    typeof value.email !== "string" ||
    typeof value.password !== "string" ||
    typeof value.full_name !== "string" ||
    typeof value.role !== "string"
  ) {
    throw new HttpError(400, "INVALID_REQUEST", "Invalid request body");
  }

  return {
    email: value.email,
    password: value.password,
    full_name: value.full_name,
    role: value.role,
  };
}

export class CreateUserService {
  constructor(private readonly repository: CreateUserRepository) {}

  async execute(
    authHeader: string | null,
    rawInput: unknown,
  ): Promise<CreateUserResult> {
    if (!authHeader) {
      throw new HttpError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const caller = await this.repository.getCaller(authHeader);
    if (!caller) {
      throw new HttpError(401, "UNAUTHORIZED", "Unauthorized");
    }

    if (!(await this.repository.isAdmin(authHeader, caller.id))) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Forbidden: admin access required",
      );
    }

    const input = parseInput(rawInput);
    let user: CreatedUser | null;

    try {
      user = await this.repository.createUser(input);
    } catch (error) {
      throw new HttpError(
        400,
        "CREATE_USER_FAILED",
        error instanceof Error ? error.message : "Unable to create user",
      );
    }

    if (input.role !== "user" && user) {
      try {
        await this.repository.assignRole(String(user.id), input.role);
      } catch (error) {
        return {
          status: 207,
          body: {
            user,
            warning: `User created but role assignment failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        };
      }
    }

    return { status: 200, body: { user } };
  }
}
