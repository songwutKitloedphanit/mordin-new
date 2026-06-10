DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM books
    WHERE subdistrict_code IS NOT NULL OR zip_code IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Rollback refused: books.subdistrict_code or books.zip_code contains data';
  END IF;
END;
$$;

ALTER TABLE books
  DROP COLUMN IF EXISTS subdistrict_code,
  DROP COLUMN IF EXISTS zip_code;
