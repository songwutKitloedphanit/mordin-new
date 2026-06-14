DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_major_land_scores') THEN
        CREATE TABLE "fertilizer_major_land_scores" (
            "fertilizer_major_land_score_id" SERIAL NOT NULL, 
            "soil_grade_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "result_id" integer, 
            "soil_grade_level_id" integer NOT NULL, 
            "result_value" double precision, 
            "comment" text, 
            "comment_uid" integer, 
            "updated_at" bigint NOT NULL, 
            "updated_uid" integer NOT NULL, 
            CONSTRAINT "soil_grade_book" UNIQUE ("soil_grade_id", "book_id"), 
            CONSTRAINT "PK_d4b98e0e763f57304fde919fdfb" PRIMARY KEY ("fertilizer_major_land_score_id")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_major_land_usages') THEN
        CREATE TABLE "fertilizer_major_land_usages" (
            "fertilizer_major_land_usage_id" SERIAL NOT NULL, 
            "service_fertilizer_major_usage_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "total_score_id" integer NOT NULL, 
            "fertilizer_major_id" integer NOT NULL, 
            "updated_at" bigint NOT NULL, 
            "grade" integer NOT NULL, 
            "grade_text" character varying(255), 
            "formula" character varying(8), 
            "use_rate" double precision, 
            "cost_per_rai" double precision, 
            CONSTRAINT "ser_fer_major_usage_book" UNIQUE ("service_fertilizer_major_usage_id", "book_id"), 
            CONSTRAINT "PK_c50c8195a14cc115d0ce62937d6" PRIMARY KEY ("fertilizer_major_land_usage_id")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_minor_land_usages') THEN
        CREATE TABLE "fertilizer_minor_land_usages" (
            "fertilizer_minor_land_usage_id" SERIAL NOT NULL, 
            "service_fertilizer_minor_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "result_id" integer NOT NULL, 
            "level" integer NOT NULL, 
            "fertilizer_minor_id" integer NOT NULL, 
            "result_value" double precision, 
            "fertilizer_minor_name" character varying(255), 
            "use_rate_per_rai" double precision, 
            "total_usage" double precision, 
            "price_per_rai" double precision, 
            "total_price" double precision, 
            "updated_uid" integer NOT NULL, 
            "updated_at" bigint, 
            CONSTRAINT "serv_fer_minor_book" UNIQUE ("service_fertilizer_minor_id", "book_id"), 
            CONSTRAINT "PK_c12b41e49224ed39f68130feba7" PRIMARY KEY ("fertilizer_minor_land_usage_id")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_major_land_usages_logs') THEN
        CREATE TABLE "fertilizer_major_land_usages_logs" (
            "inserted_at" bigint NOT NULL, 
            "deleted_at" bigint, 
            "fertilizerMajorLandUsageId" integer NOT NULL, 
            "service_fertilizer_major_usage_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "total_score_id" integer NOT NULL, 
            "fertilizer_major_id" integer NOT NULL, 
            "grade" integer NOT NULL, 
            "grade_text" character varying(255), 
            "formula" character varying(8), 
            "use_rate" double precision, 
            "cost_per_rai" double precision, 
            CONSTRAINT "PK_9a7a47680318069b0f139f8e848" PRIMARY KEY ("inserted_at", "fertilizerMajorLandUsageId")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_minor_land_usages_logs') THEN
        CREATE TABLE "fertilizer_minor_land_usages_logs" (
            "inserted_at" bigint NOT NULL, 
            "deleted_at" bigint, 
            "fertilizerMinorLandUsageId" integer NOT NULL, 
            "service_fertilizer_minor_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "result_id" integer NOT NULL, 
            "level" integer NOT NULL, 
            "fertilizer_minor_id" integer NOT NULL, 
            "result_value" double precision, 
            "fertilizer_minor_name" character varying(255), 
            "use_rate_per_rai" double precision, 
            "total_usage" double precision, 
            "price_per_rai" double precision, 
            "total_price" double precision, 
            "updated_uid" integer NOT NULL, 
            CONSTRAINT "PK_276c517c29c29cb6ce1a46c4a45" PRIMARY KEY ("inserted_at", "fertilizerMinorLandUsageId")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fertilizer_major_land_scores_logs') THEN
        CREATE TABLE "fertilizer_major_land_scores_logs" (
            "inserted_at" bigint NOT NULL, 
            "deleted_at" bigint, 
            "fertilizerMajorLandScoreId" integer NOT NULL, 
            "soil_grade_id" integer NOT NULL, 
            "book_id" integer NOT NULL, 
            "result_id" integer, 
            "soil_grade_level_id" integer NOT NULL, 
            "result_value" double precision, 
            "comment" text, 
            "comment_uid" integer, 
            "updated_uid" integer NOT NULL, 
            CONSTRAINT "PK_3c2a5909f9f30058955c924d458" PRIMARY KEY ("inserted_at", "fertilizerMajorLandScoreId")
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ce29dc247484a7a5e7c7d83e1a7') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_ce29dc247484a7a5e7c7d83e1a7" FOREIGN KEY ("soil_grade_id") REFERENCES "soil_grades"("soil_grade_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_090334e013eef03374ccb8a3342') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_090334e013eef03374ccb8a3342" FOREIGN KEY ("book_id") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a803145a79fa0ffce66a44bff5c') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_a803145a79fa0ffce66a44bff5c" FOREIGN KEY ("result_id") REFERENCES "results"("result_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_1e4d841ef0ad95d55b920536eba') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_1e4d841ef0ad95d55b920536eba" FOREIGN KEY ("soil_grade_level_id") REFERENCES "soil_grade_levels"("soil_grade_level_id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a6e978e58802733d25fe4d7e802') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_a6e978e58802733d25fe4d7e802" FOREIGN KEY ("comment_uid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_775a692593b1ee1dce2ab2aaa14') THEN
        ALTER TABLE "fertilizer_major_land_scores" ADD CONSTRAINT "FK_775a692593b1ee1dce2ab2aaa14" FOREIGN KEY ("updated_uid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_73632f80f95d3486fc51c90ecab') THEN
        ALTER TABLE "fertilizer_major_land_usages" ADD CONSTRAINT "FK_73632f80f95d3486fc51c90ecab" FOREIGN KEY ("service_fertilizer_major_usage_id") REFERENCES "service_fertilizer_major_usages"("service_fertilizer_major_usage_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_57a50d6b9f2291f1d10dc4d7f6a') THEN
        ALTER TABLE "fertilizer_major_land_usages" ADD CONSTRAINT "FK_57a50d6b9f2291f1d10dc4d7f6a" FOREIGN KEY ("book_id") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_56370370132b7bdb7ba61a15036') THEN
        ALTER TABLE "fertilizer_major_land_usages" ADD CONSTRAINT "FK_56370370132b7bdb7ba61a15036" FOREIGN KEY ("fertilizer_major_id") REFERENCES "fertilizer_majors"("fertilizer_major_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_0ab42af96d53dab6f04252c7dd7') THEN
        ALTER TABLE "fertilizer_major_land_usages" ADD CONSTRAINT "FK_0ab42af96d53dab6f04252c7dd7" FOREIGN KEY ("total_score_id") REFERENCES "fertilizer_major_land_scores"("fertilizer_major_land_score_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bb55a3d135fca710611c8649751') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_bb55a3d135fca710611c8649751" FOREIGN KEY ("fertilizer_minor_id") REFERENCES "fertilizer_minors"("fertilizer_minor_id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_138f9b735c39b470432abb89bf0') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_138f9b735c39b470432abb89bf0" FOREIGN KEY ("service_fertilizer_minor_id", "level") REFERENCES "service_fertilizer_minor_usages"("service_fertilizer_minor_id","level") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a8a19ecc5185a6cc42722d89176') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_a8a19ecc5185a6cc42722d89176" FOREIGN KEY ("book_id") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_4b29e0e0a626b8c90d03ae29c45') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_4b29e0e0a626b8c90d03ae29c45" FOREIGN KEY ("result_id") REFERENCES "results"("result_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_f881e3675af37fcc5d267d2081b') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_f881e3675af37fcc5d267d2081b" FOREIGN KEY ("service_fertilizer_minor_id") REFERENCES "service_fertilizer_minors"("service_fertilizer_minor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_392b9e438aa494c8066d6cd643f') THEN
        ALTER TABLE "fertilizer_minor_land_usages" ADD CONSTRAINT "FK_392b9e438aa494c8066d6cd643f" FOREIGN KEY ("updated_uid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END
$$;