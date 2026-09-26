import { CreateUserService } from "./application/CreateUserService.ts";
import { SupabaseCreateUserRepository } from "./infrastructure/SupabaseCreateUserRepository.ts";
import { CreateUserController } from "./presentation/CreateUserController.ts";

export function createCreateUserModule(): CreateUserController {
  return new CreateUserController(
    new CreateUserService(new SupabaseCreateUserRepository()),
  );
}
