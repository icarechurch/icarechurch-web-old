export interface GalleryRepository {
  list(): Promise<unknown[]>;
  create(image: unknown): Promise<unknown>;
  delete(input: { id: string }): Promise<string>;
}
