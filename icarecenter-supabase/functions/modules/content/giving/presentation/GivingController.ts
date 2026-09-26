import { GetGivingSettings } from "../application/GetGivingSettings.ts";
import { UpdateGivingSettings } from "../application/UpdateGivingSettings.ts";

export class GivingController {
  constructor(
    private readonly getGivingSettings: GetGivingSettings,
    private readonly updateGivingSettings: UpdateGivingSettings,
  ) {}

  get(): Promise<unknown> {
    return this.getGivingSettings.execute();
  }

  update(input: { id: string; updates: Record<string, unknown> }): Promise<void> {
    return this.updateGivingSettings.execute(input);
  }
}
