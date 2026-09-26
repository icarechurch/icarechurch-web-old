import type { SermonRepository } from "../domain/ports/SermonRepository.ts";

export class ListSermons {
  public constructor(private readonly repository: SermonRepository) {}

  public execute(): Promise<unknown[]> {
    return this.repository.list();
  }
}
