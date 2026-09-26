import type { ServiceTimeRepository } from "../domain/ports/ServiceTimeRepository.ts";

export class UpdateServiceTime {
  constructor(private readonly repository: ServiceTimeRepository) {}

  execute(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.repository.update(input);
  }
}
