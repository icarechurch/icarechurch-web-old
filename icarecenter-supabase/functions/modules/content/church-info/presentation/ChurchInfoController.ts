import { GetChurchInfo } from "../application/GetChurchInfo.ts";

export class ChurchInfoController {
  constructor(private readonly getChurchInfo: GetChurchInfo) {}

  get(): Promise<unknown | null> {
    return this.getChurchInfo.execute();
  }
}
