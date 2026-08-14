-- Keep analytics exact without scanning the raw visit table for every insert.

CREATE TABLE IF NOT EXISTS public.analytics_unique_visitors (
  visitor_id VARCHAR(255) PRIMARY KEY,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_unique_visitors (
  date DATE NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (date, page_path, visitor_id)
);

CREATE TABLE IF NOT EXISTS public.analytics_tracked_pages (
  page_path VARCHAR(255) PRIMARY KEY,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_counter_shards (
  counter_name TEXT NOT NULL CHECK (
    counter_name IN ('total_visits', 'unique_visitors', 'total_pages')
  ),
  shard SMALLINT NOT NULL CHECK (shard >= 0 AND shard < 64),
  counter BIGINT NOT NULL DEFAULT 0 CHECK (counter >= 0),
  PRIMARY KEY (counter_name, shard)
);

INSERT INTO public.analytics_counter_shards (counter_name, shard)
SELECT counter_name, shard
FROM (
  VALUES
    ('total_visits'::TEXT),
    ('unique_visitors'::TEXT),
    ('total_pages'::TEXT)
) AS counters(counter_name)
CROSS JOIN generate_series(0, 63) AS shards(shard)
ON CONFLICT (counter_name, shard) DO NOTHING;

ALTER TABLE public.analytics_unique_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_unique_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_tracked_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_counter_shards ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_daily_unique_visitors_visitor
  ON public.analytics_daily_unique_visitors(visitor_id);

-- Backfill the exact key sets before replacing the trigger.
INSERT INTO public.analytics_unique_visitors (visitor_id, first_seen_at)
SELECT visitor_id, MIN(visited_at)
FROM public.analytics_visits
WHERE visitor_id IS NOT NULL
GROUP BY visitor_id
ON CONFLICT (visitor_id) DO NOTHING;

INSERT INTO public.analytics_daily_unique_visitors (date, page_path, visitor_id)
SELECT DISTINCT DATE(visited_at), page_path, visitor_id
FROM public.analytics_visits
WHERE visitor_id IS NOT NULL
ON CONFLICT (date, page_path, visitor_id) DO NOTHING;

INSERT INTO public.analytics_tracked_pages (page_path, first_seen_at)
SELECT page_path, MIN(visited_at)
FROM public.analytics_visits
GROUP BY page_path
ON CONFLICT (page_path) DO NOTHING;

-- Rebuild daily rollups once so historical data is exact before live writes use them.
INSERT INTO public.analytics_daily_stats (
  date,
  page_path,
  total_visits,
  unique_visitors,
  created_at,
  updated_at
)
SELECT
  DATE(visited_at),
  page_path,
  COUNT(*)::INTEGER,
  COUNT(DISTINCT visitor_id)::INTEGER,
  now(),
  now()
FROM public.analytics_visits
GROUP BY DATE(visited_at), page_path
ON CONFLICT (date, page_path) DO UPDATE SET
  total_visits = EXCLUDED.total_visits,
  unique_visitors = EXCLUDED.unique_visitors,
  updated_at = now();

UPDATE public.analytics_counter_shards
SET counter = 0;

INSERT INTO public.analytics_counter_shards (counter_name, shard, counter)
SELECT
  'total_visits',
  (((hashtext(id::TEXT)::BIGINT % 64) + 64) % 64)::SMALLINT,
  COUNT(*)::BIGINT
FROM public.analytics_visits
GROUP BY (((hashtext(id::TEXT)::BIGINT % 64) + 64) % 64)::SMALLINT
ON CONFLICT (counter_name, shard) DO UPDATE
SET counter = EXCLUDED.counter;

INSERT INTO public.analytics_counter_shards (counter_name, shard, counter)
SELECT
  'unique_visitors',
  (((hashtext(visitor_id)::BIGINT % 64) + 64) % 64)::SMALLINT,
  COUNT(*)::BIGINT
FROM public.analytics_unique_visitors
GROUP BY (((hashtext(visitor_id)::BIGINT % 64) + 64) % 64)::SMALLINT
ON CONFLICT (counter_name, shard) DO UPDATE
SET counter = EXCLUDED.counter;

INSERT INTO public.analytics_counter_shards (counter_name, shard, counter)
SELECT
  'total_pages',
  (((hashtext(page_path)::BIGINT % 64) + 64) % 64)::SMALLINT,
  COUNT(*)::BIGINT
FROM public.analytics_tracked_pages
GROUP BY (((hashtext(page_path)::BIGINT % 64) + 64) % 64)::SMALLINT
ON CONFLICT (counter_name, shard) DO UPDATE
SET counter = EXCLUDED.counter;

UPDATE public.analytics_overall_stats
SET
  total_visits = (
    SELECT COALESCE(SUM(counter), 0)
    FROM public.analytics_counter_shards
    WHERE counter_name = 'total_visits'
  ),
  unique_visitors = (
    SELECT COALESCE(SUM(counter), 0)
    FROM public.analytics_counter_shards
    WHERE counter_name = 'unique_visitors'
  ),
  total_pages_tracked = (
    SELECT COALESCE(SUM(counter), 0)::INTEGER
    FROM public.analytics_counter_shards
    WHERE counter_name = 'total_pages'
  ),
  last_updated = now();

CREATE OR REPLACE FUNCTION public.increment_analytics_counter(
  counter_name_input TEXT,
  key_input TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  shard_input SMALLINT;
BEGIN
  shard_input := (((hashtext(key_input)::BIGINT % 64) + 64) % 64)::SMALLINT;

  UPDATE public.analytics_counter_shards
  SET counter = counter + 1
  WHERE counter_name = counter_name_input
    AND shard = shard_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_daily_analytics_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  inserted_count INTEGER;
  visit_date DATE;
BEGIN
  visit_date := DATE(NEW.visited_at);

  INSERT INTO public.analytics_daily_stats (
    date,
    page_path,
    total_visits,
    unique_visitors
  )
  VALUES (visit_date, NEW.page_path, 1, 0)
  ON CONFLICT (date, page_path)
  DO UPDATE SET
    total_visits = public.analytics_daily_stats.total_visits + 1,
    updated_at = now();

  PERFORM public.increment_analytics_counter('total_visits', NEW.id::TEXT);

  INSERT INTO public.analytics_tracked_pages (page_path)
  VALUES (NEW.page_path)
  ON CONFLICT (page_path) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 1 THEN
    PERFORM public.increment_analytics_counter('total_pages', NEW.page_path);
  END IF;

  IF NEW.visitor_id IS NOT NULL THEN
    INSERT INTO public.analytics_daily_unique_visitors (
      date,
      page_path,
      visitor_id
    )
    VALUES (visit_date, NEW.page_path, NEW.visitor_id)
    ON CONFLICT (date, page_path, visitor_id) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    IF inserted_count = 1 THEN
      UPDATE public.analytics_daily_stats
      SET unique_visitors = unique_visitors + 1,
          updated_at = now()
      WHERE date = visit_date
        AND page_path = NEW.page_path;
    END IF;

    INSERT INTO public.analytics_unique_visitors (visitor_id)
    VALUES (NEW.visitor_id)
    ON CONFLICT (visitor_id) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    IF inserted_count = 1 THEN
      PERFORM public.increment_analytics_counter(
        'unique_visitors',
        NEW.visitor_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_daily_analytics_stats
  ON public.analytics_visits;

CREATE TRIGGER trigger_update_daily_analytics_stats
  AFTER INSERT ON public.analytics_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_analytics_stats();

CREATE OR REPLACE FUNCTION public.get_analytics_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  total_visits BIGINT,
  unique_visitors BIGINT,
  total_pages INTEGER,
  avg_daily_visits NUMERIC,
  top_pages JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH counter_totals AS (
    SELECT
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'total_visits'), 0)::BIGINT AS total_visits,
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'unique_visitors'), 0)::BIGINT AS unique_visitors,
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'total_pages'), 0)::INTEGER AS total_pages
    FROM public.analytics_counter_shards
  ),
  daily_totals AS (
    SELECT ads.date, SUM(ads.total_visits)::NUMERIC AS total_visits
    FROM public.analytics_daily_stats AS ads
    WHERE ads.date >= CURRENT_DATE - GREATEST(COALESCE(days_back, 30), 0)
    GROUP BY ads.date
  ),
  top_pages AS (
    SELECT
      ads.page_path,
      SUM(ads.total_visits)::BIGINT AS total_visits
    FROM public.analytics_daily_stats AS ads
    WHERE ads.date >= CURRENT_DATE - GREATEST(COALESCE(days_back, 30), 0)
    GROUP BY ads.page_path
    ORDER BY total_visits DESC
    LIMIT 10
  )
  SELECT
    counter_totals.total_visits,
    counter_totals.unique_visitors,
    counter_totals.total_pages,
    COALESCE((SELECT AVG(total_visits) FROM daily_totals), 0)::NUMERIC(10, 2),
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('page', top_pages.page_path, 'visits', top_pages.total_visits)
          ORDER BY top_pages.total_visits DESC
        )
        FROM top_pages
      ),
      '[]'::JSON
    )
  FROM counter_totals;
END;
$$;
