import type { PastorRepository } from "../domain/ports/PastorRepository.ts";

export class CreatePastor {
  constructor(private readonly repository: PastorRepository) {}

  execute(pastor: unknown): Promise<unknown> {
    return this.repository.create(pastor);
  }
}
