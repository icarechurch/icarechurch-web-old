import type { SermonRepository } from "../domain/ports/SermonRepository.ts";

export class GetLatestSermon {
  public constructor(private readonly repository: SermonRepository) {}

  public execute(): Promise<unknown | null> {
    return this.repository.latest();
  }
}
