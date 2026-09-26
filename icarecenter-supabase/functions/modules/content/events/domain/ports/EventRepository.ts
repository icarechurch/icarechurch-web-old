export interface EventRepository {
  list(): Promise<unknown[]>;
  create(input: unknown): Promise<unknown>;
  update(input: { id: string } & Record<string, unknown>): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
}
