-- Return the complete admin analytics overview through one bounded database call.

CREATE OR REPLACE FUNCTION public.get_analytics_overview(
  days_back INTEGER DEFAULT 30,
  recent_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  summary JSONB,
  daily_visits JSONB,
  page_popularity JSONB,
  recent_visits JSONB,
  content_analytics JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH bounds AS (
    SELECT
      GREATEST(LEAST(COALESCE(days_back, 30), 365), 0) AS days_back,
      GREATEST(LEAST(COALESCE(recent_limit, 20), 100), 1) AS recent_limit
  ),
  daily_rows AS (
    SELECT
      ads.date,
      SUM(ads.total_visits)::BIGINT AS total_visits,
      SUM(ads.unique_visitors)::BIGINT AS unique_visitors
    FROM public.analytics_daily_stats AS ads
    CROSS JOIN bounds
    WHERE ads.date >= CURRENT_DATE - bounds.days_back
    GROUP BY ads.date
    ORDER BY ads.date ASC
  ),
  page_rows AS (
    SELECT
      ads.page_path,
      SUM(ads.total_visits)::BIGINT AS total_visits,
      SUM(ads.unique_visitors)::BIGINT AS unique_visitors
    FROM public.analytics_daily_stats AS ads
    CROSS JOIN bounds
    WHERE ads.date >= CURRENT_DATE - bounds.days_back
    GROUP BY ads.page_path
    ORDER BY total_visits DESC, ads.page_path ASC
    LIMIT 10
  ),
  recent_rows AS (
    SELECT
      av.id,
      av.page_path,
      av.visited_at,
      av.user_agent,
      av.referrer
    FROM public.analytics_visits AS av
    ORDER BY av.visited_at DESC, av.id DESC
    LIMIT (SELECT recent_limit FROM bounds)
  ),
  counter_totals AS (
    SELECT
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'total_visits'), 0)::BIGINT AS total_visits,
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'unique_visitors'), 0)::BIGINT AS unique_visitors,
      COALESCE(SUM(counter) FILTER (WHERE counter_name = 'total_pages'), 0)::INTEGER AS total_pages
    FROM public.analytics_counter_shards
  ),
  event_counts AS (
    SELECT
      COUNT(*)::INTEGER AS total_events,
      COUNT(*) FILTER (WHERE status = 'scheduled')::INTEGER AS scheduled_events,
      COUNT(*) FILTER (WHERE status = 'postponed')::INTEGER AS postponed_events,
      COUNT(*) FILTER (WHERE status = 'done')::INTEGER AS done_events
    FROM public.events
  )
  SELECT
    jsonb_build_object(
      'total_visits', counter_totals.total_visits,
      'unique_visitors', counter_totals.unique_visitors,
      'total_pages', counter_totals.total_pages,
      'avg_daily_visits', COALESCE(
        (SELECT ROUND(AVG(daily_rows.total_visits), 2) FROM daily_rows),
        0
      ),
      'top_pages', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('page', page_rows.page_path, 'visits', page_rows.total_visits)
            ORDER BY page_rows.total_visits DESC
          )
          FROM page_rows
        ),
        '[]'::JSONB
      )
    ) AS summary,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(daily_rows) ORDER BY daily_rows.date ASC) FROM daily_rows),
      '[]'::JSONB
    ) AS daily_visits,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(page_rows) ORDER BY page_rows.total_visits DESC) FROM page_rows),
      '[]'::JSONB
    ) AS page_popularity,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(recent_rows) ORDER BY recent_rows.visited_at DESC) FROM recent_rows),
      '[]'::JSONB
    ) AS recent_visits,
    jsonb_build_object(
      'total_ministries', (SELECT COUNT(*)::INTEGER FROM public.ministries),
      'total_events', event_counts.total_events,
      'scheduled_events', event_counts.scheduled_events,
      'postponed_events', event_counts.postponed_events,
      'done_events', event_counts.done_events
    ) AS content_analytics
  FROM counter_totals
  CROSS JOIN event_counts;
$$;
