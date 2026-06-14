DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM books_logs
    WHERE subdistrict_code IS NOT NULL OR zip_code IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: books_logs.subdistrict_code or books_logs.zip_code contains data';
  END IF;
END;
$$;

ALTER TABLE books_logs
  DROP COLUMN IF EXISTS subdistrict_code,
  DROP COLUMN IF EXISTS zip_code;
