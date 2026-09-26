import type { SermonRepository } from "../domain/ports/SermonRepository.ts";

export class CreateSermon {
  public constructor(private readonly repository: SermonRepository) {}

  public execute(input: unknown): Promise<unknown> {
    return this.repository.create(input);
  }
}
