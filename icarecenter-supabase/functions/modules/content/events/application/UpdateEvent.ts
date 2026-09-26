import type { EventRepository } from "../domain/ports/EventRepository.ts";

export class UpdateEvent {
  constructor(private readonly repository: EventRepository) {}

  execute(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.repository.update(input);
  }
}
