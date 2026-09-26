import type { SermonRepository } from "../domain/ports/SermonRepository.ts";

export class UpdateSermon {
  public constructor(private readonly repository: SermonRepository) {}

  public execute(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    return this.repository.update(input);
  }
}
