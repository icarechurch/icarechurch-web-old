import type { MinistryRepository } from "../domain/ports/MinistryRepository.ts";

export class DeleteMinistry {
  constructor(private readonly repository: MinistryRepository) {}

  execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
