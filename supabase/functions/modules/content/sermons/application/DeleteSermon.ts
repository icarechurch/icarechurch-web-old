import type { SermonRepository } from "../domain/ports/SermonRepository.ts";

export class DeleteSermon {
  public constructor(private readonly repository: SermonRepository) {}

  public execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
