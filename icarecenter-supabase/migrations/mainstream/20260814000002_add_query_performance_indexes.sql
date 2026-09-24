-- Support the activity log filters and database-side reductions.

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_action_type
  ON public.activity_logs(created_at DESC, action_type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_entity_type
  ON public.activity_logs(created_at DESC, entity_type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_user_id
  ON public.activity_logs(created_at DESC, user_id);

CREATE OR REPLACE FUNCTION public.get_activity_log_summary()
RETURNS TABLE(total BIGINT, by_action_type JSONB)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  WITH action_counts AS (
    SELECT action_type, COUNT(*)::BIGINT AS action_count
    FROM public.activity_logs
    GROUP BY action_type
  )
  SELECT
    COALESCE((SELECT SUM(action_count) FROM action_counts), 0)::BIGINT,
    COALESCE(
      (
        SELECT jsonb_object_agg(action_type, action_count ORDER BY action_type)
        FROM action_counts
      ),
      '{}'::JSONB
    );
$$;

CREATE OR REPLACE FUNCTION public.get_activity_log_action_types()
RETURNS TABLE(action_type TEXT)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT DISTINCT logs.action_type
  FROM public.activity_logs AS logs
  WHERE logs.action_type IS NOT NULL
  ORDER BY logs.action_type;
$$;

CREATE OR REPLACE FUNCTION public.get_activity_log_entity_types()
RETURNS TABLE(entity_type TEXT)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT DISTINCT logs.entity_type
  FROM public.activity_logs AS logs
  WHERE logs.entity_type IS NOT NULL
  ORDER BY logs.entity_type;
$$;

REVOKE EXECUTE ON FUNCTION public.get_activity_log_summary() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_activity_log_action_types() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_activity_log_entity_types() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_activity_log_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_log_action_types() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_log_entity_types() TO authenticated;
