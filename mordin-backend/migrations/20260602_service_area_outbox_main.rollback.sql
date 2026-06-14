DO $$
BEGIN
  IF to_regclass('public.audit_outbox') IS NOT NULL
    AND EXISTS (SELECT 1 FROM audit_outbox)
  THEN
    RAISE EXCEPTION 'Rollback refused: audit_outbox contains events';
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS service_areas_exclusive_lock ON service_areas;
DROP TRIGGER IF EXISTS qr_codes_service_area_shared_lock ON qr_codes;
DROP TRIGGER IF EXISTS books_service_area_shared_lock ON books;
DROP TRIGGER IF EXISTS farmers_service_area_shared_lock ON farmers;
DROP FUNCTION IF EXISTS lock_service_area_change_exclusive();
DROP FUNCTION IF EXISTS lock_service_area_reference_shared();
DROP TABLE IF EXISTS audit_outbox;
