-- Fix the get_analytics_summary function - resolve ambiguous column references

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
      (SELECT AVG(daily_stats.daily_visits)::NUMERIC(10,2) 
       FROM (
         SELECT SUM(ads.total_visits) as daily_visits
         FROM analytics_daily_stats ads
         WHERE ads.date >= CURRENT_DATE - days_back
         GROUP BY ads.date
       ) daily_stats), 
      0::NUMERIC
    ) as avg_daily_visits,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'page', top_pages_data.page_path, 
          'visits', top_pages_data.total_visits
        ) ORDER BY top_pages_data.total_visits DESC
      )
      FROM (
        SELECT ads2.page_path, SUM(ads2.total_visits) as total_visits
        FROM analytics_daily_stats ads2
        WHERE ads2.date >= CURRENT_DATE - days_back
        GROUP BY ads2.page_path
        ORDER BY SUM(ads2.total_visits) DESC
        LIMIT 10
      ) top_pages_data),
      '[]'::JSON
    ) as top_pages
  FROM analytics_overall_stats os
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;