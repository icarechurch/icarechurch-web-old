import type { GivingRepository } from "../domain/ports/GivingRepository.ts";

export class UpdateGivingSettings {
  constructor(private readonly repository: GivingRepository) {}

  execute(
    input: { id: string; updates: Record<string, unknown> },
  ): Promise<void> {
    return this.repository.update(input);
  }
}
