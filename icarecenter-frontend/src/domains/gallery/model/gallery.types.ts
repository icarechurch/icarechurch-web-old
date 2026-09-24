export type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
};

export type GalleryImageInsert = Omit<GalleryImage, "id" | "created_at"> & { id?: string };
