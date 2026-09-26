import { CreateSermon } from "../application/CreateSermon.ts";
import { DeleteSermon } from "../application/DeleteSermon.ts";
import { GetLatestSermon } from "../application/GetLatestSermon.ts";
import { ListSermons } from "../application/ListSermons.ts";
import { UpdateSermon } from "../application/UpdateSermon.ts";

export class SermonController {
  public constructor(
    private readonly listSermons: ListSermons,
    private readonly getLatestSermon: GetLatestSermon,
    private readonly createSermon: CreateSermon,
    private readonly updateSermon: UpdateSermon,
    private readonly deleteSermon: DeleteSermon,
  ) {}

  public list(): Promise<unknown[]> {
    return this.listSermons.execute();
  }

  public latest(): Promise<unknown | null> {
    return this.getLatestSermon.execute();
  }

  public create(input: unknown): Promise<unknown> {
    return this.createSermon.execute(input);
  }

  public update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    return this.updateSermon.execute(input);
  }

  public delete(input: { id: string }): Promise<string> {
    return this.deleteSermon.execute(input);
  }
}
