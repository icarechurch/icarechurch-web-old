import { GetEventPopupSettings } from "../application/GetEventPopupSettings.ts";
import { UpsertEventPopupSettings } from "../application/UpsertEventPopupSettings.ts";
import type { EventPopupSettings } from "../domain/ports/EventPopupRepository.ts";

export class EventPopupController {
  constructor(
    private readonly getEventPopupSettings: GetEventPopupSettings,
    private readonly upsertEventPopupSettings: UpsertEventPopupSettings,
  ) {}

  get(): Promise<unknown> {
    return this.getEventPopupSettings.execute();
  }

  upsert(input: EventPopupSettings): Promise<unknown> {
    return this.upsertEventPopupSettings.execute(input);
  }
}
