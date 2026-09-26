import type { EventPopupRepository } from "../domain/ports/EventPopupRepository.ts";

export class GetEventPopupSettings {
  constructor(private readonly repository: EventPopupRepository) {}

  execute(): Promise<unknown> {
    return this.repository.get();
  }
}
