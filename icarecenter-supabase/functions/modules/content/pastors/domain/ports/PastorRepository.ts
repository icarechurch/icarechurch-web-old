export type PastorSortItem = { id: string; sort_order: number };

export interface PastorRepository {
  list(): Promise<unknown[]>;
  create(pastor: unknown): Promise<unknown>;
  update(input: { id: string } & Record<string, unknown>): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
  sort(items: PastorSortItem[]): Promise<PastorSortItem[]>;
}
