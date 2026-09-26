import type {
  MinistryRepository,
  MinistrySortItem,
} from "../domain/ports/MinistryRepository.ts";
import { MinistryController } from "./MinistryController.ts";

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

  async sort(items: MinistrySortItem[]): Promise<MinistrySortItem[]> {
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

Deno.test("ministry controller delegates every operation to its use case", async () => {
  const repository = new FakeMinistryRepository();
  const controller = new MinistryController(repository);
  const ministry = { name: "Care" };
  const update = { id: "ministry-1", name: "Community Care" };
  const items = [{ id: "ministry-1", sort_order: 1 }];

  assertEquals(await controller.list(), [{ id: "ministry-1" }]);
  assertEquals(await controller.create(ministry), ministry);
  assertEquals(await controller.update(update), update);
  assertEquals(await controller.delete({ id: "ministry-1" }), "ministry-1");
  assertEquals(await controller.sort(items), items);
  assertEquals(repository.calls, [
    ["list"],
    ["create", ministry],
    ["update", update],
    ["delete", { id: "ministry-1" }],
    ["sort", items],
  ]);
});
