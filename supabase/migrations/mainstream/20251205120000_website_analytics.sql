-- Create website analytics tables

-- Create analytics_visits table to track page visits
CREATE TABLE public.analytics_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255), -- UUID generated on client side for tracking unique visitors
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    session_id VARCHAR(255),
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_daily_stats for aggregated daily data (for performance)
CREATE TABLE public.analytics_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    total_visits INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(date, page_path)
);

-- Create analytics_overall_stats for quick access to totals
CREATE TABLE public.analytics_overall_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_visits BIGINT NOT NULL DEFAULT 0,
    unique_visitors BIGINT NOT NULL DEFAULT 0,
    total_pages_tracked INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial overall stats record
INSERT INTO public.analytics_overall_stats (total_visits, unique_visitors, total_pages_tracked)
VALUES (0, 0, 0);

-- Enable RLS
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_overall_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables - only admins can read analytics data
CREATE POLICY "Only admins can read analytics_visits"
ON public.analytics_visits FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert analytics_visits"
ON public.analytics_visits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can read analytics_daily_stats"
ON public.analytics_daily_stats FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can read analytics_overall_stats"
ON public.analytics_overall_stats FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_analytics_visits_visited_at ON public.analytics_visits(visited_at DESC);
CREATE INDEX idx_analytics_visits_page_path ON public.analytics_visits(page_path);
CREATE INDEX idx_analytics_visits_visitor_id ON public.analytics_visits(visitor_id);
CREATE INDEX idx_analytics_daily_stats_date ON public.analytics_daily_stats(date DESC);
CREATE INDEX idx_analytics_daily_stats_page_path ON public.analytics_daily_stats(page_path);

-- Create function to update daily stats (called by trigger)
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

  -- Update overall stats
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
    last_updated = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats when new visit is inserted
CREATE TRIGGER trigger_update_daily_analytics_stats
  AFTER INSERT ON public.analytics_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics_stats();

-- Create function to get analytics summary for admins
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
    os.total_visits,
    os.unique_visitors,
    os.total_pages_tracked,
    COALESCE(
      (SELECT AVG(daily_visits)::NUMERIC(10,2) 
       FROM (
         SELECT SUM(total_visits) as daily_visits
         FROM analytics_daily_stats 
         WHERE date >= CURRENT_DATE - days_back
         GROUP BY date
       ) daily_avg), 
      0
    ) as avg_daily_visits,
    (
      SELECT json_agg(
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
      ) top_pages_data
    ) as top_pages
  FROM analytics_overall_stats os
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;