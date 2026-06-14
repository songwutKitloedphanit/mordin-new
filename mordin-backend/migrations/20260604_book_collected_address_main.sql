ALTER TABLE books
  ADD COLUMN IF NOT EXISTS subdistrict_code varchar(6),
  ADD COLUMN IF NOT EXISTS zip_code integer;

CREATE INDEX IF NOT EXISTS idx_books_subdistrict_code
  ON books (subdistrict_code);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint constraint_info
    JOIN pg_attribute column_info
      ON column_info.attrelid = constraint_info.conrelid
      AND column_info.attnum = ANY (constraint_info.conkey)
    WHERE constraint_info.contype = 'f'
      AND constraint_info.conrelid = 'books'::regclass
      AND column_info.attname = 'subdistrict_code'
  ) THEN
    ALTER TABLE books
      ADD CONSTRAINT books_subdistrict_code_fk
      FOREIGN KEY (subdistrict_code)
      REFERENCES subdistricts(code);
  END IF;
END;
$$;
