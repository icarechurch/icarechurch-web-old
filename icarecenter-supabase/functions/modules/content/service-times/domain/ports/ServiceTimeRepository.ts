export type SortServiceTimeInput = Array<{ id: string; sort_order: number }>;

export interface ServiceTimeRepository {
  list(): Promise<unknown>;
  create(serviceTime: unknown): Promise<unknown>;
  update(input: { id: string } & Record<string, unknown>): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
  sort(items: SortServiceTimeInput): Promise<SortServiceTimeInput>;
}
