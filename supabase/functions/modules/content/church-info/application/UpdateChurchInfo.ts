import type {
  ChurchInfoRepository,
  ChurchInfoUpdate,
} from "../domain/ports/ChurchInfoRepository.ts";

export class UpdateChurchInfo {
  constructor(private readonly repository: ChurchInfoRepository) {}

  execute(input: ChurchInfoUpdate): Promise<unknown | null> {
    return this.repository.update(input);
  }
}
