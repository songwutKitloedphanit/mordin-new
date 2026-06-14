DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM factories_logs
    WHERE audit_event_id IS NOT NULL OR action IS NOT NULL
  ) OR EXISTS (
    SELECT 1
    FROM service_areas_logs
    WHERE audit_event_id IS NOT NULL OR action IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: factory or service-area logs contain audit events';
  END IF;
END;
$$;

DROP INDEX IF EXISTS service_areas_logs_audit_event_id_idx;
DROP INDEX IF EXISTS factories_logs_audit_event_id_idx;
ALTER TABLE service_areas_logs
  DROP COLUMN IF EXISTS action,
  DROP COLUMN IF EXISTS audit_event_id;
ALTER TABLE factories_logs
  DROP COLUMN IF EXISTS action,
  DROP COLUMN IF EXISTS audit_event_id;
