import type { GalleryRepository } from "../domain/ports/GalleryRepository.ts";

export class CreateGalleryImage {
  constructor(private readonly repository: GalleryRepository) {}

  execute(image: unknown): Promise<unknown> {
    return this.repository.create(image);
  }
}
