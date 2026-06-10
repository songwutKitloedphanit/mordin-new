-- Reverse 20260605_fk_indexes_hot_paths_main.sql.
-- These are pure FK indexes (no columns/data added), so dropping them is safe
-- and only affects query plans, never stored data.

DROP INDEX IF EXISTS idx_books_farmer_id;
DROP INDEX IF EXISTS idx_books_land_id;
DROP INDEX IF EXISTS idx_books_service_type_id;
DROP INDEX IF EXISTS idx_books_analysis_service_calendar_id;
DROP INDEX IF EXISTS idx_books_received_service_calendar_id;

DROP INDEX IF EXISTS idx_fmls_book_id;
DROP INDEX IF EXISTS idx_fmls_result_id;
DROP INDEX IF EXISTS idx_fmls_soil_grade_level_id;

DROP INDEX IF EXISTS idx_fmlu_book_id;
DROP INDEX IF EXISTS idx_fmlu_total_score_id;

DROP INDEX IF EXISTS idx_fminlu_book_id;
DROP INDEX IF EXISTS idx_fminlu_result_id;

DROP INDEX IF EXISTS idx_farmers_factory_id;

DROP INDEX IF EXISTS idx_lands_subdistrict_code;

DROP INDEX IF EXISTS idx_results_laboratory_setting_id;
