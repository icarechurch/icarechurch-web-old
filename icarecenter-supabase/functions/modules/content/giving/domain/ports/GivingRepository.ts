export interface GivingRepository {
  get(): Promise<unknown>;
  update(
    input: { id: string; updates: Record<string, unknown> },
  ): Promise<void>;
}
