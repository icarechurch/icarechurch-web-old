import type { PastorRepository } from "../domain/ports/PastorRepository.ts";

export class UpdatePastor {
  constructor(private readonly repository: PastorRepository) {}

  execute(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.repository.update(input);
  }
}
