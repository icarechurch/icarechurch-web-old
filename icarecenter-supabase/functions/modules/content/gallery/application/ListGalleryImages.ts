import type { GalleryRepository } from "../domain/ports/GalleryRepository.ts";

export class ListGalleryImages {
  constructor(private readonly repository: GalleryRepository) {}

  execute(): Promise<unknown[]> {
    return this.repository.list();
  }
}
