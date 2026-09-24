-- Allow moderators to read analytics_visits
DROP POLICY IF EXISTS "Only admins can read analytics_visits" ON public.analytics_visits;
CREATE POLICY "Admins and Moderators can read analytics_visits"
    ON public.analytics_visits FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );

-- Allow moderators to read analytics_daily_stats
DROP POLICY IF EXISTS "Only admins can read analytics_daily_stats" ON public.analytics_daily_stats;
CREATE POLICY "Admins and Moderators can read analytics_daily_stats"
    ON public.analytics_daily_stats FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'moderator')
    );
