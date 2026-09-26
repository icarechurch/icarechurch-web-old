import { CreatePastor } from "../application/CreatePastor.ts";
import { DeletePastor } from "../application/DeletePastor.ts";
import { ListPastors } from "../application/ListPastors.ts";
import { SortPastors } from "../application/SortPastors.ts";
import { UpdatePastor } from "../application/UpdatePastor.ts";
import type { PastorSortItem } from "../domain/ports/PastorRepository.ts";

export class PastorController {
  constructor(
    private readonly listPastors: ListPastors,
    private readonly createPastor: CreatePastor,
    private readonly updatePastor: UpdatePastor,
    private readonly deletePastor: DeletePastor,
    private readonly sortPastors: SortPastors,
  ) {}

  list(): Promise<unknown[]> {
    return this.listPastors.execute();
  }

  create(pastor: unknown): Promise<unknown> {
    return this.createPastor.execute(pastor);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.updatePastor.execute(input);
  }

  delete(input: { id: string }): Promise<string> {
    return this.deletePastor.execute(input);
  }

  sort(items: PastorSortItem[]): Promise<PastorSortItem[]> {
    return this.sortPastors.execute(items);
  }
}
