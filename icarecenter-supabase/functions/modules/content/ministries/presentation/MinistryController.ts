import { CreateMinistry } from "../application/CreateMinistry.ts";
import { DeleteMinistry } from "../application/DeleteMinistry.ts";
import { ListMinistries } from "../application/ListMinistries.ts";
import { SortMinistries } from "../application/SortMinistries.ts";
import { UpdateMinistry } from "../application/UpdateMinistry.ts";
import type {
  MinistryRepository,
  MinistrySortItem,
} from "../domain/ports/MinistryRepository.ts";

export class MinistryController {
  private readonly createMinistry: CreateMinistry;
  private readonly deleteMinistry: DeleteMinistry;
  private readonly listMinistries: ListMinistries;
  private readonly sortMinistries: SortMinistries;
  private readonly updateMinistry: UpdateMinistry;

  constructor(repository: MinistryRepository) {
    this.createMinistry = new CreateMinistry(repository);
    this.deleteMinistry = new DeleteMinistry(repository);
    this.listMinistries = new ListMinistries(repository);
    this.sortMinistries = new SortMinistries(repository);
    this.updateMinistry = new UpdateMinistry(repository);
  }

  list(): Promise<unknown[]> {
    return this.listMinistries.execute();
  }

  create(input: unknown): Promise<unknown> {
    return this.createMinistry.execute(input);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.updateMinistry.execute(input);
  }

  delete(input: { id: string }): Promise<string> {
    return this.deleteMinistry.execute(input);
  }

  sort(items: MinistrySortItem[]): Promise<MinistrySortItem[]> {
    return this.sortMinistries.execute(items);
  }
}
