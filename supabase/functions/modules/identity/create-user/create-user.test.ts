import { HttpError } from "../../../_shared/errors.ts";
import { CreateUserService } from "./application/CreateUserService.ts";
import type { CreateUserRepository } from "./domain/ports/CreateUserRepository.ts";

function createRepository(
  overrides: Partial<CreateUserRepository> = {},
): CreateUserRepository {
  return {
    getCaller: async () => ({ id: "admin-1" }),
    isAdmin: async () => true,
    createUser: async () => ({ id: "user-1", email: "new@example.com" }),
    assignRole: async () => {},
    ...overrides,
  };
}

Deno.test("rejects create-user requests without caller authorization", async () => {
  const service = new CreateUserService(createRepository());

  try {
    await service.execute(null, {});
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return;
    throw error;
  }

  throw new Error("Expected an unauthorized create-user request");
});

Deno.test("preserves partial success when role assignment fails", async () => {
  const service = new CreateUserService(
    createRepository({
      assignRole: async () => {
        throw new Error("role insert failed");
      },
    }),
  );

  const result = await service.execute("Bearer token", {
    email: "new@example.com",
    password: "password",
    full_name: "New User",
    role: "admin",
  });

  if (result.status !== 207) throw new Error("Expected partial success status");
  if (!result.body.warning?.includes("role insert failed")) {
    throw new Error("Expected role assignment warning");
  }
});
