import type { PastorRepository } from "../domain/ports/PastorRepository.ts";

export class DeletePastor {
  constructor(private readonly repository: PastorRepository) {}

  execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
