import { invokeFunction } from "@/infrastructure/supabase/functions";
import type { GalleryImage, GalleryImageInsert } from "@/domains/gallery/model/gallery.types";

export const galleryApi = {
  async getGalleryImages(): Promise<GalleryImage[]> { return invokeFunction<GalleryImage[]>("content-data", { resource: "gallery", operation: "list" }); },
  async create(image: GalleryImageInsert): Promise<GalleryImage> { return invokeFunction<GalleryImage>("content-data", { resource: "gallery", operation: "create", input: image }); },
  async deleteGalleryImage(id: string): Promise<string> { return invokeFunction<string>("content-data", { resource: "gallery", operation: "delete", input: { id } }); },
};
