import { assertEquals } from "jsr:@std/assert@1";
import { CreatePastor } from "./CreatePastor.ts";
import { DeletePastor } from "./DeletePastor.ts";
import { ListPastors } from "./ListPastors.ts";
import { SortPastors } from "./SortPastors.ts";
import { UpdatePastor } from "./UpdatePastor.ts";
import type { PastorRepository } from "../domain/ports/PastorRepository.ts";

type SortItem = { id: string; sort_order: number };

class FakePastorRepository implements PastorRepository {
  createdPastor: unknown;
  deletedInput: { id: string } | undefined;
  sortedItems: SortItem[] | undefined;
  updatedInput: ({ id: string } & Record<string, unknown>) | undefined;

  constructor(private readonly pastors: unknown[]) {}

  create(pastor: unknown): Promise<unknown> {
    this.createdPastor = pastor;
    return Promise.resolve(pastor);
  }

  delete(input: { id: string }): Promise<string> {
    this.deletedInput = input;
    return Promise.resolve(input.id);
  }

  list(): Promise<unknown[]> {
    return Promise.resolve(this.pastors);
  }

  sort(items: SortItem[]): Promise<SortItem[]> {
    this.sortedItems = items;
    return Promise.resolve(items);
  }

  update(input: { id: string } & Record<string, unknown>): Promise<unknown> {
    this.updatedInput = input;
    return Promise.resolve(input);
  }
}

Deno.test("ListPastors returns pastors from its repository", async () => {
  const pastors = [{ id: "pastor-1" }];
  const useCase = new ListPastors(new FakePastorRepository(pastors));

  assertEquals(await useCase.execute(), pastors);
});

Deno.test("CreatePastor forwards the pastor and returns its repository result", async () => {
  const repository = new FakePastorRepository([]);
  const pastor = { name: "Pastor Ian" };
  const useCase = new CreatePastor(repository);

  assertEquals(await useCase.execute(pastor), pastor);
  assertEquals(repository.createdPastor, pastor);
});

Deno.test("UpdatePastor forwards its input and returns its repository result", async () => {
  const repository = new FakePastorRepository([]);
  const input = { id: "pastor-1", name: "Pastor Ian" };
  const useCase = new UpdatePastor(repository);

  assertEquals(await useCase.execute(input), input);
  assertEquals(repository.updatedInput, input);
});

Deno.test("DeletePastor forwards its input and returns the deleted ID", async () => {
  const repository = new FakePastorRepository([]);
  const input = { id: "pastor-1" };
  const useCase = new DeletePastor(repository);

  assertEquals(await useCase.execute(input), input.id);
  assertEquals(repository.deletedInput, input);
});

Deno.test("SortPastors forwards every sort item and returns the repository result", async () => {
  const repository = new FakePastorRepository([]);
  const items = [{ id: "pastor-1", sort_order: 1 }];
  const useCase = new SortPastors(repository);

  assertEquals(await useCase.execute(items), items);
  assertEquals(repository.sortedItems, items);
});

Deno.test("SortPastors forwards an empty sort request", async () => {
  const repository = new FakePastorRepository([]);
  const useCase = new SortPastors(repository);

  assertEquals(await useCase.execute([]), []);
  assertEquals(repository.sortedItems, []);
});
