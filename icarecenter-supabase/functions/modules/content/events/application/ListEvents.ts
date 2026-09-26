import type { EventRepository } from "../domain/ports/EventRepository.ts";

export class ListEvents {
  constructor(private readonly repository: EventRepository) {}

  execute(): Promise<unknown[]> {
    return this.repository.list();
  }
}
