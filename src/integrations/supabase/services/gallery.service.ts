import { supabase } from "../client";

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
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return data as GalleryImage[];
  },

  async create(image: GalleryImageInsert): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from("gallery_images")
      .insert([image])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as GalleryImage;
  },

  async deleteGalleryImage(id: string): Promise<string> {
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
    return id;
  },
};
