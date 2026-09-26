import { assertEquals } from "jsr:@std/assert@1";
import { CreateGalleryImage } from "./CreateGalleryImage.ts";
import { DeleteGalleryImage } from "./DeleteGalleryImage.ts";
import { ListGalleryImages } from "./ListGalleryImages.ts";
import type { GalleryRepository } from "../domain/ports/GalleryRepository.ts";

class FakeGalleryRepository implements GalleryRepository {
  createdImage: unknown;
  deletedInput: { id: string } | undefined;

  constructor(private readonly images: unknown[]) {}

  create(image: unknown): Promise<unknown> {
    this.createdImage = image;
    return Promise.resolve(image);
  }

  delete(input: { id: string }): Promise<string> {
    this.deletedInput = input;
    return Promise.resolve(input.id);
  }

  list(): Promise<unknown[]> {
    return Promise.resolve(this.images);
  }
}

Deno.test("ListGalleryImages returns images from its repository", async () => {
  const images = [{ id: "image-1" }];
  const useCase = new ListGalleryImages(new FakeGalleryRepository(images));

  assertEquals(await useCase.execute(), images);
});

Deno.test("CreateGalleryImage forwards the image and returns its repository result", async () => {
  const repository = new FakeGalleryRepository([]);
  const image = { title: "Worship" };
  const useCase = new CreateGalleryImage(repository);

  assertEquals(await useCase.execute(image), image);
  assertEquals(repository.createdImage, image);
});

Deno.test("DeleteGalleryImage forwards its input and returns the deleted ID", async () => {
  const repository = new FakeGalleryRepository([]);
  const input = { id: "image-1" };
  const useCase = new DeleteGalleryImage(repository);

  assertEquals(await useCase.execute(input), input.id);
  assertEquals(repository.deletedInput, input);
});
