import { CreateServiceTime } from "../application/CreateServiceTime.ts";
import { DeleteServiceTime } from "../application/DeleteServiceTime.ts";
import { ListServiceTimes } from "../application/ListServiceTimes.ts";
import { SortServiceTimes } from "../application/SortServiceTimes.ts";
import { UpdateServiceTime } from "../application/UpdateServiceTime.ts";
import type {
  ServiceTimeRepository,
  SortServiceTimeInput,
} from "../domain/ports/ServiceTimeRepository.ts";

export class ServiceTimeController {
  constructor(private readonly repository: ServiceTimeRepository) {}

  list(): Promise<unknown> {
    return new ListServiceTimes(this.repository).execute();
  }

  create(serviceTime: unknown): Promise<unknown> {
    return new CreateServiceTime(this.repository).execute(serviceTime);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    return new UpdateServiceTime(this.repository).execute(input);
  }

  delete(input: { id: string }): Promise<string> {
    return new DeleteServiceTime(this.repository).execute(input);
  }

  sort(items: SortServiceTimeInput): Promise<SortServiceTimeInput> {
    return new SortServiceTimes(this.repository).execute(items);
  }
}
