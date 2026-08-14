import type { SermonInsert } from "@/domains/sermons/model/sermons.types";

export const INITIAL_SERMON_FORM_DATA: SermonInsert = {
  title: "",
  description: "",
  speaker: "",
  sermon_date: "",
  video_url: "",
  audio_url: "",
  scripture_reference: "",
  series_name: "",
  thumbnail_url: "",
  duration_minutes: null,
  is_featured: false,
};
