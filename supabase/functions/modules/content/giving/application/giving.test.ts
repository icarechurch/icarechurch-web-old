import { assertEquals } from "jsr:@std/assert@1";
import { GetGivingSettings } from "./GetGivingSettings.ts";
import { UpdateGivingSettings } from "./UpdateGivingSettings.ts";
import type { GivingRepository } from "../domain/ports/GivingRepository.ts";

class FakeGivingRepository implements GivingRepository {
  updatedInput: { id: string; updates: Record<string, unknown> } | undefined;

  constructor(private readonly settings: unknown) {}

  get(): Promise<unknown> {
    return Promise.resolve(this.settings);
  }

  update(
    input: { id: string; updates: Record<string, unknown> },
  ): Promise<void> {
    this.updatedInput = input;
    return Promise.resolve();
  }
}

Deno.test("GetGivingSettings returns the settings singleton from its repository", async () => {
  const settings = { id: "giving-1", donation_platform_name: "Give" };
  const useCase = new GetGivingSettings(new FakeGivingRepository(settings));

  assertEquals(await useCase.execute(), settings);
});

Deno.test("UpdateGivingSettings forwards its update payload", async () => {
  const repository = new FakeGivingRepository({});
  const input = {
    id: "giving-1",
    updates: { donation_platform_name: "Give" },
  };
  const useCase = new UpdateGivingSettings(repository);

  assertEquals(await useCase.execute(input), undefined);
  assertEquals(repository.updatedInput, input);
});
