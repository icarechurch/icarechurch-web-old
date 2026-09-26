import type { ChurchInfoRepository } from "../domain/ports/ChurchInfoRepository.ts";

export class GetChurchInfo {
  constructor(private readonly repository: ChurchInfoRepository) {}

  execute(): Promise<unknown | null> {
    return this.repository.get();
  }
}
