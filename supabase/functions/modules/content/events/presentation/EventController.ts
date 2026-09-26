import type { CreateEvent } from "../application/CreateEvent.ts";
import type { DeleteEvent } from "../application/DeleteEvent.ts";
import type { ListEvents } from "../application/ListEvents.ts";
import type { UpdateEvent } from "../application/UpdateEvent.ts";

export class EventController {
  constructor(
    private readonly listEvents: Pick<ListEvents, "execute">,
    private readonly createEvent: Pick<CreateEvent, "execute">,
    private readonly updateEvent: Pick<UpdateEvent, "execute">,
    private readonly deleteEvent: Pick<DeleteEvent, "execute">,
  ) {}

  list(): Promise<unknown[]> {
    return this.listEvents.execute();
  }

  create(input: unknown): Promise<unknown> {
    return this.createEvent.execute(input);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return this.updateEvent.execute(input);
  }

  delete(input: { id: string }): Promise<string> {
    return this.deleteEvent.execute(input);
  }
}
