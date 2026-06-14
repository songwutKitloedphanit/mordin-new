CREATE TABLE IF NOT EXISTS audit_outbox (
  audit_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar(30) NOT NULL,
  entity_id integer NOT NULL,
  action varchar(20) NOT NULL,
  actor_uid integer NOT NULL,
  before_payload jsonb,
  after_payload jsonb,
  status varchar(20) NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_outbox_status_check CHECK (status IN ('pending', 'processed', 'failed'))
);

CREATE INDEX IF NOT EXISTS audit_outbox_pending_idx
  ON audit_outbox (status, created_at);
CREATE INDEX IF NOT EXISTS farmers_service_area_id_idx
  ON farmers (service_area_id);
CREATE INDEX IF NOT EXISTS books_service_area_id_idx
  ON books (service_area_id);
CREATE INDEX IF NOT EXISTS qr_codes_service_area_id_idx
  ON qr_codes (service_area_id);

CREATE OR REPLACE FUNCTION lock_service_area_reference_shared()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_area_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock_shared(742001, NEW.service_area_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION lock_service_area_change_exclusive()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(742001, OLD.service_area_id);
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS farmers_service_area_shared_lock ON farmers;
CREATE TRIGGER farmers_service_area_shared_lock
  BEFORE INSERT OR UPDATE OF service_area_id ON farmers
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_reference_shared();

DROP TRIGGER IF EXISTS books_service_area_shared_lock ON books;
CREATE TRIGGER books_service_area_shared_lock
  BEFORE INSERT OR UPDATE OF service_area_id ON books
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_reference_shared();

DROP TRIGGER IF EXISTS qr_codes_service_area_shared_lock ON qr_codes;
CREATE TRIGGER qr_codes_service_area_shared_lock
  BEFORE INSERT OR UPDATE OF service_area_id ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_reference_shared();

DROP TRIGGER IF EXISTS service_areas_exclusive_lock ON service_areas;
CREATE TRIGGER service_areas_exclusive_lock
  BEFORE UPDATE OF factory_id OR DELETE ON service_areas
  FOR EACH ROW EXECUTE FUNCTION lock_service_area_change_exclusive();
