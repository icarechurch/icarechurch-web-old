import type { EventRepository } from "../domain/ports/EventRepository.ts";

export class DeleteEvent {
  constructor(private readonly repository: EventRepository) {}

  execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
