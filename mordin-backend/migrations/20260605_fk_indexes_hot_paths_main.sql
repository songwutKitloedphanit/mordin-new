-- Add indexes on the foreign-key columns that the dashboard and list queries
-- actually JOIN/filter on. PostgreSQL does NOT auto-index FK columns, so these
-- joins fall back to sequential scans as the tables grow.
--
-- Scope: only FKs exercised by real queries (the 12-join dashboard in
-- fertilizer-major-land-scores.service.ts and the land/farmer/book lists).
-- Deliberately EXCLUDES audit columns (update_uid / comment_uid / recorded_uid
-- -> users), which are written but never joined on the read paths.
--
-- Safe to run now while tables are small (CREATE INDEX briefly locks the table;
-- at the current hundreds-of-rows scale this is sub-second). All statements are
-- idempotent (IF NOT EXISTS) so re-running is a no-op.

-- books: the central table, joined from almost every read path.
CREATE INDEX IF NOT EXISTS idx_books_farmer_id
  ON books (farmer_id);
CREATE INDEX IF NOT EXISTS idx_books_land_id
  ON books (land_id);
CREATE INDEX IF NOT EXISTS idx_books_service_type_id
  ON books (service_type_id);
CREATE INDEX IF NOT EXISTS idx_books_analysis_service_calendar_id
  ON books (analysis_service_calendar_id);
CREATE INDEX IF NOT EXISTS idx_books_received_service_calendar_id
  ON books (received_service_calendar_id);

-- fertilizer_major_land_scores: scanned + joined by the soil/score dashboard query.
CREATE INDEX IF NOT EXISTS idx_fmls_book_id
  ON fertilizer_major_land_scores (book_id);
CREATE INDEX IF NOT EXISTS idx_fmls_result_id
  ON fertilizer_major_land_scores (result_id);
CREATE INDEX IF NOT EXISTS idx_fmls_soil_grade_level_id
  ON fertilizer_major_land_scores (soil_grade_level_id);

-- fertilizer_major_land_usages: joined by the fertilizer (major) usage dashboard query.
CREATE INDEX IF NOT EXISTS idx_fmlu_book_id
  ON fertilizer_major_land_usages (book_id);
CREATE INDEX IF NOT EXISTS idx_fmlu_total_score_id
  ON fertilizer_major_land_usages (total_score_id);

-- fertilizer_minor_land_usages: joined by the fertilizer (minor) usage dashboard query.
CREATE INDEX IF NOT EXISTS idx_fminlu_book_id
  ON fertilizer_minor_land_usages (book_id);
CREATE INDEX IF NOT EXISTS idx_fminlu_result_id
  ON fertilizer_minor_land_usages (result_id);

-- farmers: filtered/joined by factory in farmer lists and the dashboard factory filter.
CREATE INDEX IF NOT EXISTS idx_farmers_factory_id
  ON farmers (factory_id);

-- lands: joined to subdistrict in the land list and the dashboard location rollup.
CREATE INDEX IF NOT EXISTS idx_lands_subdistrict_code
  ON lands (subdistrict_code);

-- results: joined to laboratory_setting in result aggregation.
CREATE INDEX IF NOT EXISTS idx_results_laboratory_setting_id
  ON results (laboratory_setting_id);
