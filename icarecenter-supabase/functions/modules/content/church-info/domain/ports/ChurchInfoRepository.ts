export interface ChurchInfoRepository {
  get(): Promise<unknown | null>;
}
