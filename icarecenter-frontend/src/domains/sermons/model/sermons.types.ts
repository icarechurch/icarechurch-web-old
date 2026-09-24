export type Sermon = {
  id: string;
  title: string;
  description: string | null;
  speaker: string;
  sermon_date: string;
  video_url: string | null;
  audio_url: string | null;
  scripture_reference: string | null;
  series_name: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type SermonInsert = Omit<Sermon, "id" | "created_at" | "updated_at"> & { id?: string };
