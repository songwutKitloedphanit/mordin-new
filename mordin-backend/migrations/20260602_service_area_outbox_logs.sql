DO $$
DECLARE
  constraint_row record;
BEGIN
  FOR constraint_row IN
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE contype = 'u'
      AND conrelid IN ('factories_logs'::regclass, 'service_areas_logs'::regclass)
  LOOP
    EXECUTE format(
      'ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I',
      constraint_row.table_name,
      constraint_row.conname
    );
  END LOOP;
END;
$$;

ALTER TABLE factories_logs
  ADD COLUMN IF NOT EXISTS audit_event_id uuid,
  ADD COLUMN IF NOT EXISTS action varchar(20);
ALTER TABLE service_areas_logs
  ADD COLUMN IF NOT EXISTS audit_event_id uuid,
  ADD COLUMN IF NOT EXISTS action varchar(20);

CREATE UNIQUE INDEX IF NOT EXISTS factories_logs_audit_event_id_idx
  ON factories_logs (audit_event_id)
  WHERE audit_event_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS service_areas_logs_audit_event_id_idx
  ON service_areas_logs (audit_event_id)
  WHERE audit_event_id IS NOT NULL;
