import type { MinistryRepository } from "../domain/ports/MinistryRepository.ts";

export class UpdateMinistry {
  constructor(private readonly repository: MinistryRepository) {}

  execute(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.repository.update(input);
  }
}
