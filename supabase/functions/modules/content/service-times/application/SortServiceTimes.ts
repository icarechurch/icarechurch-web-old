import type {
  ServiceTimeRepository,
  SortServiceTimeInput,
} from "../domain/ports/ServiceTimeRepository.ts";

export class SortServiceTimes {
  constructor(private readonly repository: ServiceTimeRepository) {}

  execute(items: SortServiceTimeInput): Promise<SortServiceTimeInput> {
    return this.repository.sort(items);
  }
}
