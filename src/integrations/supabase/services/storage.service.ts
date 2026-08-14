import { supabase } from "../client";

export type UploadImageParams = {
  file: File;
  bucket: string;
  folder?: string;
};

export type UploadImageResult = {
  publicUrl: string;
  fileName: string;
};

export const storageService = {
  async uploadImage(params: UploadImageParams): Promise<UploadImageResult> {
    const fileExt = params.file.name.split(".").pop();
    const fileName = params.folder
      ? `${params.folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(params.bucket)
      .upload(fileName, params.file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(params.bucket).getPublicUrl(fileName);

    return { publicUrl, fileName };
  },

  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      throw error;
    }
  },

  getPublicUrl(bucket: string, fileName: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  },
};
