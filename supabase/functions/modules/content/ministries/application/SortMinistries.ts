import type {
  MinistryRepository,
  MinistrySortItem,
} from "../domain/ports/MinistryRepository.ts";

export class SortMinistries {
  constructor(private readonly repository: MinistryRepository) {}

  execute(items: MinistrySortItem[]): Promise<MinistrySortItem[]> {
    return this.repository.sort(items);
  }
}
