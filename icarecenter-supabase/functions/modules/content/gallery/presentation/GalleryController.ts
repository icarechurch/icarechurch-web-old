import { CreateGalleryImage } from "../application/CreateGalleryImage.ts";
import { DeleteGalleryImage } from "../application/DeleteGalleryImage.ts";
import { ListGalleryImages } from "../application/ListGalleryImages.ts";

export class GalleryController {
  constructor(
    private readonly listGalleryImages: ListGalleryImages,
    private readonly createGalleryImage: CreateGalleryImage,
    private readonly deleteGalleryImage: DeleteGalleryImage,
  ) {}

  list(): Promise<unknown[]> {
    return this.listGalleryImages.execute();
  }

  create(image: unknown): Promise<unknown> {
    return this.createGalleryImage.execute(image);
  }

  delete(input: { id: string }): Promise<string> {
    return this.deleteGalleryImage.execute(input);
  }
}
