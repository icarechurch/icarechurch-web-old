-- Fix the get_analytics_summary function

CREATE OR REPLACE FUNCTION get_analytics_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  total_visits BIGINT,
  unique_visitors BIGINT,
  total_pages INTEGER,
  avg_daily_visits NUMERIC,
  top_pages JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(os.total_visits, 0::BIGINT) as total_visits,
    COALESCE(os.unique_visitors, 0::BIGINT) as unique_visitors,
    COALESCE(os.total_pages_tracked, 0) as total_pages,
    COALESCE(
      (SELECT AVG(daily_visits)::NUMERIC(10,2) 
       FROM (
         SELECT SUM(total_visits) as daily_visits
         FROM analytics_daily_stats 
         WHERE date >= CURRENT_DATE - days_back
         GROUP BY date
       ) daily_avg), 
      0::NUMERIC
    ) as avg_daily_visits,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'page', page_path, 
          'visits', total_visits
        ) ORDER BY total_visits DESC
      )
      FROM (
        SELECT page_path, SUM(total_visits) as total_visits
        FROM analytics_daily_stats 
        WHERE date >= CURRENT_DATE - days_back
        GROUP BY page_path
        ORDER BY total_visits DESC
        LIMIT 10
      ) top_pages_data),
      '[]'::JSON
    ) as top_pages
  FROM analytics_overall_stats os
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;