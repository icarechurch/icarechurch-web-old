export type ChurchInfoUpdate = { id: string } & Record<string, unknown>;

export interface ChurchInfoRepository {
  get(): Promise<unknown | null>;
  update(input: ChurchInfoUpdate): Promise<unknown | null>;
}
