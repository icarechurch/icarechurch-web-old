import { CreateUserService } from "../application/CreateUserService.ts";

export class CreateUserController {
  constructor(private readonly service: CreateUserService) {}

  execute(authHeader: string | null, input: unknown) {
    return this.service.execute(authHeader, input);
  }
}
