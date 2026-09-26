import { assertEquals } from "jsr:@std/assert@1";
import { GetChurchInfo } from "./GetChurchInfo.ts";
import type { ChurchInfoRepository } from "../domain/ports/ChurchInfoRepository.ts";

class FakeChurchInfoRepository implements ChurchInfoRepository {
  constructor(private readonly churchInfo: unknown | null) {}

  get(): Promise<unknown | null> {
    return Promise.resolve(this.churchInfo);
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
