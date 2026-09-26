import type { ServiceTimeRepository } from "../domain/ports/ServiceTimeRepository.ts";

export class ListServiceTimes {
  constructor(private readonly repository: ServiceTimeRepository) {}

  execute(): Promise<unknown> {
    return this.repository.list();
  }
}
