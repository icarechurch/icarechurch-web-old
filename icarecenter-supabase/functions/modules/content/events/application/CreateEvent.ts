import type { EventRepository } from "../domain/ports/EventRepository.ts";

export class CreateEvent {
  constructor(private readonly repository: EventRepository) {}

  execute(input: unknown): Promise<unknown> {
    return this.repository.create(input);
  }
}
