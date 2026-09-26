import type { MinistryRepository } from "../domain/ports/MinistryRepository.ts";
import { CreateMinistry } from "./CreateMinistry.ts";
import { DeleteMinistry } from "./DeleteMinistry.ts";
import { ListMinistries } from "./ListMinistries.ts";
import { SortMinistries } from "./SortMinistries.ts";
import { UpdateMinistry } from "./UpdateMinistry.ts";

type SortItem = { id: string; sort_order: number };

class FakeMinistryRepository implements MinistryRepository {
  readonly calls: unknown[][] = [];

  async list(): Promise<unknown[]> {
    this.calls.push(["list"]);
    return [{ id: "ministry-1" }];
  }

  async create(input: unknown): Promise<unknown> {
    this.calls.push(["create", input]);
    return input;
  }

  async update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    this.calls.push(["update", input]);
    return input;
  }

  async delete(input: { id: string }): Promise<string> {
    this.calls.push(["delete", input]);
    return input.id;
  }

  async sort(items: SortItem[]): Promise<SortItem[]> {
    this.calls.push(["sort", items]);
    return items;
  }
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

Deno.test("ministry use cases forward list, create, update, and delete inputs", async () => {
  const repository = new FakeMinistryRepository();
  const ministry = { name: "Care" };
  const update = { id: "ministry-1", name: "Community Care" };

  assertEquals(await new ListMinistries(repository).execute(), [
    { id: "ministry-1" },
  ]);
  assertEquals(
    await new CreateMinistry(repository).execute(ministry),
    ministry,
  );
  assertEquals(await new UpdateMinistry(repository).execute(update), update);
  assertEquals(
    await new DeleteMinistry(repository).execute({ id: "ministry-1" }),
    "ministry-1",
  );
  assertEquals(repository.calls, [
    ["list"],
    ["create", ministry],
    ["update", update],
    ["delete", { id: "ministry-1" }],
  ]);
});

Deno.test("sort ministries forwards and returns the complete item array", async () => {
  const repository = new FakeMinistryRepository();
  const items = [
    { id: "ministry-1", sort_order: 1 },
    { id: "ministry-2", sort_order: 2 },
  ];

  assertEquals(await new SortMinistries(repository).execute(items), items);
  assertEquals(repository.calls, [["sort", items]]);
});

Deno.test("sort ministries accepts an empty item array", async () => {
  const repository = new FakeMinistryRepository();

  assertEquals(await new SortMinistries(repository).execute([]), []);
  assertEquals(repository.calls, [["sort", []]]);
});
