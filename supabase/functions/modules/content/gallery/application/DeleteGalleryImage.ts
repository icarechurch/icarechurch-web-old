import type { GalleryRepository } from "../domain/ports/GalleryRepository.ts";

export class DeleteGalleryImage {
  constructor(private readonly repository: GalleryRepository) {}

  execute(input: { id: string }): Promise<string> {
    return this.repository.delete(input);
  }
}
