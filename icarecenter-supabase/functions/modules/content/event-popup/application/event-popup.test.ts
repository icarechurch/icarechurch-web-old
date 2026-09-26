import { assertEquals } from "jsr:@std/assert@1";
import { GetEventPopupSettings } from "./GetEventPopupSettings.ts";
import { UpsertEventPopupSettings } from "./UpsertEventPopupSettings.ts";
import type { EventPopupRepository } from "../domain/ports/EventPopupRepository.ts";

type EventPopupInput = { event_id: string | null; is_enabled: boolean };

class FakeEventPopupRepository implements EventPopupRepository {
  upsertedInput: EventPopupInput | undefined;

  constructor(private readonly settings: unknown) {}

  get(): Promise<unknown> {
    return Promise.resolve(this.settings);
  }

  upsert(input: EventPopupInput): Promise<unknown> {
    this.upsertedInput = input;
    return Promise.resolve({ ...input, singleton_key: true });
  }
}

Deno.test("GetEventPopupSettings returns settings from its repository", async () => {
  const settings = { event_id: "event-1", is_enabled: true };
  const useCase = new GetEventPopupSettings(new FakeEventPopupRepository(settings));

  assertEquals(await useCase.execute(), settings);
});

Deno.test("UpsertEventPopupSettings forwards its settings and returns the repository result", async () => {
  const repository = new FakeEventPopupRepository({});
  const input = { event_id: "event-1", is_enabled: true };
  const useCase = new UpsertEventPopupSettings(repository);

  assertEquals(await useCase.execute(input), { ...input, singleton_key: true });
  assertEquals(repository.upsertedInput, input);
});
