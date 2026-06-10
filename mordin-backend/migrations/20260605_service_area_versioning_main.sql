ALTER TABLE service_areas
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS effective_from date,
  ADD COLUMN IF NOT EXISTS effective_to date,
  ADD COLUMN IF NOT EXISTS superseded_by_service_area_id integer;

ALTER TABLE service_areas
  DROP CONSTRAINT IF EXISTS unique_code_factory;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_areas_superseded_by_fk'
      AND conrelid = 'service_areas'::regclass
  ) THEN
    ALTER TABLE service_areas
      ADD CONSTRAINT service_areas_superseded_by_fk
      FOREIGN KEY (superseded_by_service_area_id)
      REFERENCES service_areas(service_area_id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS service_areas_active_code_factory_idx
  ON service_areas (code, factory_id)
  WHERE is_active;

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
  BEFORE UPDATE OF factory_id, is_active OR DELETE ON service_areas
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_change_exclusive();
