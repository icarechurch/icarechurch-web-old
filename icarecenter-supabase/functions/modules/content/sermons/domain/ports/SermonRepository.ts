export interface SermonRepository {
  list(): Promise<unknown[]>;
  latest(): Promise<unknown | null>;
  create(input: unknown): Promise<unknown>;
  update(input: { id: string } & Record<string, unknown>): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
}
