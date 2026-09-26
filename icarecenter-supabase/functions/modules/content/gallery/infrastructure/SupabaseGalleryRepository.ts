import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { GalleryRepository } from "../domain/ports/GalleryRepository.ts";
import {
  GALLERY_COLUMNS,
  MAX_PUBLIC_CONTENT_ROWS,
} from "./gallery-columns.ts";

export class SupabaseGalleryRepository implements GalleryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<unknown[]> {
    const { data, error } = await this.client
      .from("gallery_images")
      .select(GALLERY_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(MAX_PUBLIC_CONTENT_ROWS);

    if (error) throw error;
    return data;
  }

  async create(image: unknown): Promise<unknown> {
    const { data, error } = await this.client
      .from("gallery_images")
      .insert([image])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(input: { id: string }): Promise<string> {
    const { error } = await this.client
      .from("gallery_images")
      .delete()
      .eq("id", input.id);

    if (error) throw error;
    return input.id;
  }
}
