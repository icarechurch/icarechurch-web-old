import type {
  PastorRepository,
  PastorSortItem,
} from "../domain/ports/PastorRepository.ts";

export class SortPastors {
  constructor(private readonly repository: PastorRepository) {}

  execute(items: PastorSortItem[]): Promise<PastorSortItem[]> {
    return this.repository.sort(items);
  }
}
