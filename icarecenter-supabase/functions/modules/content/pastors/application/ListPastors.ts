import type { PastorRepository } from "../domain/ports/PastorRepository.ts";

export class ListPastors {
  constructor(private readonly repository: PastorRepository) {}

  execute(): Promise<unknown[]> {
    return this.repository.list();
  }
}
