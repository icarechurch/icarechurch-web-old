import { invokeFunction } from "../functions";

export type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
};

type GalleryImageInsert = Omit<
  GalleryImage,
  "id" | "created_at" | "updated_at"
>;

export const galleryService = {
  async getGalleryImages(): Promise<GalleryImage[]> {
    return invokeFunction<GalleryImage[]>("content-data", {
      resource: "gallery",
      operation: "list",
    });
  },

  async create(image: GalleryImageInsert): Promise<GalleryImage> {
    return invokeFunction<GalleryImage>("content-data", {
      resource: "gallery",
      operation: "create",
      input: image,
    });
  },

  async deleteGalleryImage(id: string): Promise<string> {
    return invokeFunction<string>("content-data", {
      resource: "gallery",
      operation: "delete",
      input: { id },
    });
  },
};
