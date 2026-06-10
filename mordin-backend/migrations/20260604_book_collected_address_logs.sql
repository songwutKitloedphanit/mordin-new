ALTER TABLE books_logs
  ADD COLUMN IF NOT EXISTS subdistrict_code varchar(6),
  ADD COLUMN IF NOT EXISTS zip_code integer;
