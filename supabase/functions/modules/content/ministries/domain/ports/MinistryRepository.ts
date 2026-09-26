export type MinistrySortItem = { id: string; sort_order: number };

export interface MinistryRepository {
  list(): Promise<unknown[]>;
  create(input: unknown): Promise<unknown>;
  update(input: { id: string } & Record<string, unknown>): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
  sort(items: MinistrySortItem[]): Promise<MinistrySortItem[]>;
}
