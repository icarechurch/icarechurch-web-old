export const MINISTRY_COLUMNS =
  "id, name, description, leader, meeting_time, image_url, sort_order, category, created_at, updated_at";
export const EVENT_COLUMNS =
  "id, title, description, event_date, event_time, location, image_url, status, created_at, updated_at";
export const SERVICE_TIME_COLUMNS =
  "id, name, time, description, audience, sort_order, created_at, updated_at";
export const CHURCH_INFO_COLUMNS =
  "id, pastor_name, pastor_email, pastor_phone, church_name, address, city, state, zip, phone, email, office_hours, fallback_stream_url, created_at, updated_at";
export const SERMON_COLUMNS =
  "id, title, description, speaker, sermon_date, video_url, audio_url, scripture_reference, series_name, thumbnail_url, duration_minutes, is_featured, created_at, updated_at";
export const GALLERY_COLUMNS =
  "id, title, description, image_url, created_at";
export const PASTOR_COLUMNS =
  "id, name, email, phone, title, bio, image_url, facebook_url, sort_order, created_at, updated_at";
export const EVENT_POPUP_COLUMNS =
  "id, singleton_key, event_id, is_enabled, created_at, updated_at";
export const GIVING_COLUMNS =
  "id, gcash_qr_url, donation_platform_name, donation_platform_url, created_at, updated_at";

export const MAX_PUBLIC_CONTENT_ROWS = 100;
