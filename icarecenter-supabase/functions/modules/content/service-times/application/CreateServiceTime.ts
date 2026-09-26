import type { ServiceTimeRepository } from "../domain/ports/ServiceTimeRepository.ts";

export class CreateServiceTime {
  constructor(private readonly repository: ServiceTimeRepository) {}

  execute(serviceTime: unknown): Promise<unknown> {
    return this.repository.create(serviceTime);
  }
}
