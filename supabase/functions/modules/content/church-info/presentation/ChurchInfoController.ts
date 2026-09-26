import { GetChurchInfo } from "../application/GetChurchInfo.ts";
import { UpdateChurchInfo } from "../application/UpdateChurchInfo.ts";
import type { ChurchInfoUpdate } from "../domain/ports/ChurchInfoRepository.ts";

export class ChurchInfoController {
  constructor(
    private readonly getChurchInfo: GetChurchInfo,
    private readonly updateChurchInfo: UpdateChurchInfo,
  ) {}

  get(): Promise<unknown | null> {
    return this.getChurchInfo.execute();
  }

  update(input: ChurchInfoUpdate): Promise<unknown | null> {
    return this.updateChurchInfo.execute(input);
  }
}
