DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM service_areas_logs
    WHERE is_active IS NOT TRUE
      OR effective_from IS NOT NULL
      OR effective_to IS NOT NULL
      OR superseded_by_service_area_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: service_areas_logs contains versioning history';
  END IF;
END;
$$;

ALTER TABLE service_areas_logs
  DROP COLUMN IF EXISTS superseded_by_service_area_id,
  DROP COLUMN IF EXISTS effective_to,
  DROP COLUMN IF EXISTS effective_from,
  DROP COLUMN IF EXISTS is_active;
