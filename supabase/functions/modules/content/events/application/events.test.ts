import type { EventRepository } from "../domain/ports/EventRepository.ts";
import { CreateEvent } from "./CreateEvent.ts";
import { DeleteEvent } from "./DeleteEvent.ts";
import { ListEvents } from "./ListEvents.ts";
import { UpdateEvent } from "./UpdateEvent.ts";

class FakeEventRepository implements EventRepository {
  readonly createdEvent = { id: "event-2", title: "Prayer Night" };
  readonly events = [{ id: "event-1", title: "Sunday Service" }];
  readonly updatedEvent = { id: "event-1", title: "Updated Service" };
  createdInput: unknown;
  deletedInput: { id: string } | undefined;
  updatedInput: ({ id: string } & Record<string, unknown>) | undefined;

  async list(): Promise<unknown[]> {
    return this.events;
  }

  async create(input: unknown): Promise<unknown> {
    this.createdInput = input;
    return this.createdEvent;
  }

  async update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    this.updatedInput = input;
    return this.updatedEvent;
  }

  async delete(input: { id: string }): Promise<string> {
    this.deletedInput = input;
    return input.id;
  }
}

Deno.test("ListEvents returns the events from its repository", async () => {
  const repository = new FakeEventRepository();

  const result = await new ListEvents(repository).execute();

  if (result !== repository.events) {
    throw new Error("ListEvents did not return the repository result");
  }
});

Deno.test("CreateEvent forwards the event and returns the repository result", async () => {
  const repository = new FakeEventRepository();
  const event = { title: "Prayer Night" };

  const result = await new CreateEvent(repository).execute(event);

  if (repository.createdInput !== event || result !== repository.createdEvent) {
    throw new Error("CreateEvent did not preserve the repository contract");
  }
});

Deno.test("UpdateEvent forwards the full event input and returns the repository result", async () => {
  const repository = new FakeEventRepository();
  const event = { id: "event-1", title: "Updated Service" };

  const result = await new UpdateEvent(repository).execute(event);

  if (repository.updatedInput !== event || result !== repository.updatedEvent) {
    throw new Error("UpdateEvent did not preserve the repository contract");
  }
});

Deno.test("DeleteEvent forwards the ID and returns the deleted ID", async () => {
  const repository = new FakeEventRepository();
  const event = { id: "event-1" };

  const result = await new DeleteEvent(repository).execute(event);

  if (repository.deletedInput !== event || result !== event.id) {
    throw new Error("DeleteEvent did not preserve the repository contract");
  }
});
