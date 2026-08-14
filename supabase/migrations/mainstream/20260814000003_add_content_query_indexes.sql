-- Support the bounded public content reads and their stable ordering.

CREATE INDEX IF NOT EXISTS idx_events_event_date_id
  ON public.events(event_date ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at_id
  ON public.gallery_images(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_ministries_sort_order_id
  ON public.ministries(sort_order ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_pastors_sort_order_id
  ON public.pastors(sort_order ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date_id
  ON public.sermons(sermon_date DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_service_times_sort_order_id
  ON public.service_times(sort_order ASC, id ASC);
