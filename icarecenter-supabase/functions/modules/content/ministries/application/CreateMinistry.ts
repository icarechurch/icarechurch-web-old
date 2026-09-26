import type { MinistryRepository } from "../domain/ports/MinistryRepository.ts";

export class CreateMinistry {
  constructor(private readonly repository: MinistryRepository) {}

  execute(input: unknown): Promise<unknown> {
    return this.repository.create(input);
  }
}
