-- Fix the update_daily_analytics_stats function to include proper WHERE clause

CREATE OR REPLACE FUNCTION update_daily_analytics_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily stats for the new visit
  INSERT INTO public.analytics_daily_stats (date, page_path, total_visits, unique_visitors)
  VALUES (
    DATE(NEW.visited_at),
    NEW.page_path,
    1,
    CASE WHEN NEW.visitor_id IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, page_path)
  DO UPDATE SET
    total_visits = analytics_daily_stats.total_visits + 1,
    unique_visitors = analytics_daily_stats.unique_visitors + 
      CASE 
        WHEN NEW.visitor_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM public.analytics_visits 
          WHERE visitor_id = NEW.visitor_id 
          AND page_path = NEW.page_path 
          AND DATE(visited_at) = DATE(NEW.visited_at)
          AND id != NEW.id
        ) THEN 1 
        ELSE 0 
      END,
    updated_at = now();

  -- Update overall stats - FIX: Added WHERE clause
  UPDATE public.analytics_overall_stats 
  SET 
    total_visits = total_visits + 1,
    unique_visitors = (
      SELECT COUNT(DISTINCT visitor_id) 
      FROM public.analytics_visits 
      WHERE visitor_id IS NOT NULL
    ),
    total_pages_tracked = (
      SELECT COUNT(DISTINCT page_path) 
      FROM public.analytics_visits
    ),
    last_updated = now()
  WHERE id = (SELECT id FROM public.analytics_overall_stats LIMIT 1);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;