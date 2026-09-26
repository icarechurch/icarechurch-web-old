import type { SermonRepository } from "../domain/ports/SermonRepository.ts";
import { CreateSermon } from "./CreateSermon.ts";
import { DeleteSermon } from "./DeleteSermon.ts";
import { GetLatestSermon } from "./GetLatestSermon.ts";
import { ListSermons } from "./ListSermons.ts";
import { UpdateSermon } from "./UpdateSermon.ts";

class InMemorySermonRepository implements SermonRepository {
  public createdInput: unknown;
  public deletedInput: { id: string } | undefined;
  public updatedInput: ({ id: string } & Record<string, unknown>) | undefined;

  public constructor(
    public sermons: unknown[] = [],
    public latestSermon: unknown | null = null,
    public createdSermon: unknown = null,
    public updatedSermon: unknown = null,
  ) {}

  public create(input: unknown): Promise<unknown> {
    this.createdInput = input;
    return Promise.resolve(this.createdSermon);
  }

  public delete(input: { id: string }): Promise<string> {
    this.deletedInput = input;
    return Promise.resolve(input.id);
  }

  public latest(): Promise<unknown | null> {
    return Promise.resolve(this.latestSermon);
  }

  public list(): Promise<unknown[]> {
    return Promise.resolve(this.sermons);
  }

  public update(
    input: { id: string } & Record<string, unknown>,
  ): Promise<unknown> {
    this.updatedInput = input;
    return Promise.resolve(this.updatedSermon);
  }
}

Deno.test("ListSermons returns an empty repository result", async () => {
  const result = await new ListSermons(new InMemorySermonRepository())
    .execute();

  if (JSON.stringify(result) !== "[]") {
    throw new Error("ListSermons did not return the repository result");
  }
});

Deno.test("GetLatestSermon returns a missing repository result", async () => {
  const result = await new GetLatestSermon(
    new InMemorySermonRepository([], null),
  ).execute();

  if (result !== null) {
    throw new Error("GetLatestSermon did not return null");
  }
});

Deno.test("CreateSermon forwards input and returns the repository result", async () => {
  const sermon = { title: "Hope" };
  const repository = new InMemorySermonRepository([], null, sermon);

  const result = await new CreateSermon(repository).execute(sermon);

  if (repository.createdInput !== sermon || result !== sermon) {
    throw new Error("CreateSermon did not delegate to the repository");
  }
});

Deno.test("UpdateSermon forwards input and returns the repository result", async () => {
  const input = { id: "sermon-1", title: "Renewed Hope" };
  const sermon = { ...input };
  const repository = new InMemorySermonRepository([], null, null, sermon);

  const result = await new UpdateSermon(repository).execute(input);

  if (repository.updatedInput !== input || result !== sermon) {
    throw new Error("UpdateSermon did not delegate to the repository");
  }
});

Deno.test("DeleteSermon forwards input and returns the deleted id", async () => {
  const input = { id: "sermon-1" };
  const repository = new InMemorySermonRepository();

  const result = await new DeleteSermon(repository).execute(input);

  if (repository.deletedInput !== input || result !== input.id) {
    throw new Error("DeleteSermon did not delegate to the repository");
  }
});
