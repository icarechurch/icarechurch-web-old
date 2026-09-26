import type {
  EventPopupRepository,
  EventPopupSettings,
} from "../domain/ports/EventPopupRepository.ts";

export class UpsertEventPopupSettings {
  constructor(private readonly repository: EventPopupRepository) {}

  execute(input: EventPopupSettings): Promise<unknown> {
    return this.repository.upsert(input);
  }
}
