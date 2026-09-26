-- Keep activity log summaries and filter values exact without rescanning the log table.

CREATE TABLE IF NOT EXISTS public.activity_log_action_counts (
  action_type TEXT PRIMARY KEY,
  total BIGINT NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS public.activity_log_entity_counts (
  entity_type TEXT PRIMARY KEY,
  total BIGINT NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS public.activity_log_totals (
  singleton_key BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton_key),
  total BIGINT NOT NULL DEFAULT 0 CHECK (total >= 0)
);

INSERT INTO public.activity_log_action_counts(action_type, total)
SELECT action_type, COUNT(*)::BIGINT
FROM public.activity_logs
WHERE action_type IS NOT NULL
GROUP BY action_type
ON CONFLICT (action_type) DO UPDATE SET total = EXCLUDED.total;

INSERT INTO public.activity_log_entity_counts(entity_type, total)
SELECT entity_type, COUNT(*)::BIGINT
FROM public.activity_logs
WHERE entity_type IS NOT NULL
GROUP BY entity_type
ON CONFLICT (entity_type) DO UPDATE SET total = EXCLUDED.total;

INSERT INTO public.activity_log_totals(singleton_key, total)
VALUES (TRUE, (SELECT COUNT(*)::BIGINT FROM public.activity_logs))
ON CONFLICT (singleton_key) DO UPDATE SET total = EXCLUDED.total;

ALTER TABLE public.activity_log_action_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log_entity_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log_totals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read activity log action counts"
  ON public.activity_log_action_counts;
CREATE POLICY "Admins can read activity log action counts"
  ON public.activity_log_action_counts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read activity log entity counts"
  ON public.activity_log_entity_counts;
CREATE POLICY "Admins can read activity log entity counts"
  ON public.activity_log_entity_counts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read activity log totals"
  ON public.activity_log_totals;
CREATE POLICY "Admins can read activity log totals"
  ON public.activity_log_totals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_activity_log_rollups()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log_totals(singleton_key, total)
    VALUES (TRUE, 1)
    ON CONFLICT (singleton_key) DO UPDATE SET total = activity_log_totals.total + 1;

    IF NEW.action_type IS NOT NULL THEN
      INSERT INTO public.activity_log_action_counts(action_type, total)
      VALUES (NEW.action_type, 1)
      ON CONFLICT (action_type) DO UPDATE SET total = activity_log_action_counts.total + 1;
    END IF;

    IF NEW.entity_type IS NOT NULL THEN
      INSERT INTO public.activity_log_entity_counts(entity_type, total)
      VALUES (NEW.entity_type, 1)
      ON CONFLICT (entity_type) DO UPDATE SET total = activity_log_entity_counts.total + 1;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activity_log_totals
    SET total = total - 1
    WHERE singleton_key = TRUE;

    IF OLD.action_type IS NOT NULL THEN
      UPDATE public.activity_log_action_counts
      SET total = total - 1
      WHERE action_type = OLD.action_type;
      DELETE FROM public.activity_log_action_counts WHERE action_type = OLD.action_type AND total <= 0;
    END IF;

    IF OLD.entity_type IS NOT NULL THEN
      UPDATE public.activity_log_entity_counts
      SET total = total - 1
      WHERE entity_type = OLD.entity_type;
      DELETE FROM public.activity_log_entity_counts WHERE entity_type = OLD.entity_type AND total <= 0;
    END IF;
  ELSE
    IF OLD.action_type IS DISTINCT FROM NEW.action_type THEN
      IF OLD.action_type IS NOT NULL THEN
        UPDATE public.activity_log_action_counts SET total = total - 1 WHERE action_type = OLD.action_type;
        DELETE FROM public.activity_log_action_counts WHERE action_type = OLD.action_type AND total <= 0;
      END IF;
      IF NEW.action_type IS NOT NULL THEN
        INSERT INTO public.activity_log_action_counts(action_type, total)
        VALUES (NEW.action_type, 1)
        ON CONFLICT (action_type) DO UPDATE SET total = activity_log_action_counts.total + 1;
      END IF;
    END IF;

    IF OLD.entity_type IS DISTINCT FROM NEW.entity_type THEN
      IF OLD.entity_type IS NOT NULL THEN
        UPDATE public.activity_log_entity_counts SET total = total - 1 WHERE entity_type = OLD.entity_type;
        DELETE FROM public.activity_log_entity_counts WHERE entity_type = OLD.entity_type AND total <= 0;
      END IF;
      IF NEW.entity_type IS NOT NULL THEN
        INSERT INTO public.activity_log_entity_counts(entity_type, total)
        VALUES (NEW.entity_type, 1)
        ON CONFLICT (entity_type) DO UPDATE SET total = activity_log_entity_counts.total + 1;
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS activity_log_rollups ON public.activity_logs;
CREATE TRIGGER activity_log_rollups
AFTER INSERT OR UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.update_activity_log_rollups();

CREATE OR REPLACE FUNCTION public.get_activity_log_summary()
RETURNS TABLE(total BIGINT, by_action_type JSONB)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE((SELECT totals.total FROM public.activity_log_totals AS totals WHERE totals.singleton_key), 0)::BIGINT,
    COALESCE(
      (
        SELECT jsonb_object_agg(counts.action_type, counts.total ORDER BY counts.action_type)
        FROM public.activity_log_action_counts AS counts
        WHERE counts.total > 0
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
  SELECT counts.action_type
  FROM public.activity_log_action_counts AS counts
  WHERE counts.total > 0
  ORDER BY counts.action_type;
$$;

CREATE OR REPLACE FUNCTION public.get_activity_log_entity_types()
RETURNS TABLE(entity_type TEXT)
LANGUAGE SQL
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT counts.entity_type
  FROM public.activity_log_entity_counts AS counts
  WHERE counts.total > 0
  ORDER BY counts.entity_type;
$$;
