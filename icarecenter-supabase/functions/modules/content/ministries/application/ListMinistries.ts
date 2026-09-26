import type { MinistryRepository } from "../domain/ports/MinistryRepository.ts";

export class ListMinistries {
  constructor(private readonly repository: MinistryRepository) {}

  execute(): Promise<unknown[]> {
    return this.repository.list();
  }
}
