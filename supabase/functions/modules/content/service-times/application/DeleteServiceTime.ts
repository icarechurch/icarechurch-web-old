import type { ServiceTimeRepository } from "../domain/ports/ServiceTimeRepository.ts";

export class DeleteServiceTime {
  constructor(private readonly repository: ServiceTimeRepository) {}

  execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
