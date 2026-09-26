import type { GivingRepository } from "../domain/ports/GivingRepository.ts";

export class GetGivingSettings {
  constructor(private readonly repository: GivingRepository) {}

  execute(): Promise<unknown> {
    return this.repository.get();
  }
}
