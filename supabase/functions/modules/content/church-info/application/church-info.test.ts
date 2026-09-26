import { assertEquals } from "jsr:@std/assert@1";
import type { ChurchInfoRepository } from "../domain/ports/ChurchInfoRepository.ts";
import { GetChurchInfo } from "./GetChurchInfo.ts";
import { UpdateChurchInfo } from "./UpdateChurchInfo.ts";

class FakeChurchInfoRepository implements ChurchInfoRepository {
  constructor(private readonly churchInfo: unknown | null) {}

  get(): Promise<unknown | null> {
    return Promise.resolve(this.churchInfo);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return Promise.resolve(input);
  }
}

Deno.test("GetChurchInfo returns the singleton result from its repository", async () => {
  const churchInfo = { name: "iCare" };
  const useCase = new GetChurchInfo(new FakeChurchInfoRepository(churchInfo));

  assertEquals(await useCase.execute(), churchInfo);
});

Deno.test("GetChurchInfo returns null when no singleton exists", async () => {
  const useCase = new GetChurchInfo(new FakeChurchInfoRepository(null));

  assertEquals(await useCase.execute(), null);
});

Deno.test("UpdateChurchInfo delegates the update to its repository", async () => {
  const input = { id: "church-1", name: "Updated iCare" };
  const useCase = new UpdateChurchInfo(new FakeChurchInfoRepository(null));

  assertEquals(await useCase.execute(input), input);
});
