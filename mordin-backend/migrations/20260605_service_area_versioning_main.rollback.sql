DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM service_areas
    WHERE is_active IS NOT TRUE
      OR effective_from IS NOT NULL
      OR effective_to IS NOT NULL
      OR superseded_by_service_area_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: service_areas contains versioning history';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM service_areas
    GROUP BY code, factory_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: service_areas contains duplicate code/factory rows';
  END IF;
END;
$$;

DROP INDEX IF EXISTS service_areas_active_code_factory_idx;

ALTER TABLE service_areas
  DROP CONSTRAINT IF EXISTS service_areas_superseded_by_fk,
  DROP COLUMN IF EXISTS superseded_by_service_area_id,
  DROP COLUMN IF EXISTS effective_to,
  DROP COLUMN IF EXISTS effective_from,
  DROP COLUMN IF EXISTS is_active;

ALTER TABLE service_areas
  ADD CONSTRAINT unique_code_factory UNIQUE (code, factory_id);

CREATE OR REPLACE FUNCTION lock_service_area_change_exclusive()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(742001, OLD.service_area_id);
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_areas_exclusive_lock ON service_areas;
CREATE TRIGGER service_areas_exclusive_lock
  BEFORE UPDATE OF factory_id OR DELETE ON service_areas
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_change_exclusive();
