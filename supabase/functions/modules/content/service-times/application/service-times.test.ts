import { CreateServiceTime } from "./CreateServiceTime.ts";
import { DeleteServiceTime } from "./DeleteServiceTime.ts";
import { ListServiceTimes } from "./ListServiceTimes.ts";
import { SortServiceTimes } from "./SortServiceTimes.ts";
import { UpdateServiceTime } from "./UpdateServiceTime.ts";
import type {
  ServiceTimeRepository,
  SortServiceTimeInput,
} from "../domain/ports/ServiceTimeRepository.ts";

class FakeServiceTimeRepository implements ServiceTimeRepository {
  readonly calls: Array<{ operation: string; input?: unknown }> = [];

  list(): Promise<unknown> {
    this.calls.push({ operation: "list" });
    return Promise.resolve([{ id: "service-time-1" }]);
  }

  create(serviceTime: unknown): Promise<unknown> {
    this.calls.push({ operation: "create", input: serviceTime });
    return Promise.resolve({ id: "service-time-1", ...asRecord(serviceTime) });
  }

  update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    this.calls.push({ operation: "update", input });
    return Promise.resolve(input);
  }

  delete(input: { id: string }): Promise<string> {
    this.calls.push({ operation: "delete", input });
    return Promise.resolve(input.id);
  }

  sort(items: SortServiceTimeInput): Promise<SortServiceTimeInput> {
    this.calls.push({ operation: "sort", input: items });
    return Promise.resolve(items);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function assertEquals(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

Deno.test("lists service times through the repository", async () => {
  const repository = new FakeServiceTimeRepository();

  const result = await new ListServiceTimes(repository).execute();

  assertEquals(result, [{ id: "service-time-1" }]);
  assertEquals(repository.calls, [{ operation: "list" }]);
});

Deno.test("creates a service time through the repository", async () => {
  const repository = new FakeServiceTimeRepository();
  const serviceTime = { name: "Sunday Worship", time: "09:00" };

  const result = await new CreateServiceTime(repository).execute(serviceTime);

  assertEquals(result, { id: "service-time-1", ...serviceTime });
  assertEquals(repository.calls, [{ operation: "create", input: serviceTime }]);
});

Deno.test("updates a service time through the repository", async () => {
  const repository = new FakeServiceTimeRepository();
  const input = { id: "service-time-1", name: "Sunday Celebration" };

  const result = await new UpdateServiceTime(repository).execute(input);

  assertEquals(result, input);
  assertEquals(repository.calls, [{ operation: "update", input }]);
});

Deno.test("deletes a service time through the repository", async () => {
  const repository = new FakeServiceTimeRepository();
  const input = { id: "service-time-1" };

  const result = await new DeleteServiceTime(repository).execute(input);

  assertEquals(result, "service-time-1");
  assertEquals(repository.calls, [{ operation: "delete", input }]);
});

Deno.test("sorts service times through the repository", async () => {
  const repository = new FakeServiceTimeRepository();
  const items = [
    { id: "service-time-2", sort_order: 1 },
    { id: "service-time-1", sort_order: 2 },
  ];

  const result = await new SortServiceTimes(repository).execute(items);

  assertEquals(result, items);
  assertEquals(repository.calls, [{ operation: "sort", input: items }]);
});

Deno.test("forwards an empty service-time sort without creating updates", async () => {
  const repository = new FakeServiceTimeRepository();

  const result = await new SortServiceTimes(repository).execute([]);

  assertEquals(result, []);
  assertEquals(repository.calls, [{ operation: "sort", input: [] }]);
});
