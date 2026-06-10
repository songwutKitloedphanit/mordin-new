--
-- PostgreSQL database dump
--

\restrict 86p8ZCCGGHPkRGrbKgHkutzIM38pr6YE7X3mOpXbmTQG225I9K8OsGjGYUBQFAg

-- Dumped from database version 17.10
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: analysis_standard_results_logs_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.analysis_standard_results_logs_recorded_type_enum AS ENUM (
    'scan',
    'file',
    'input'
);


--
-- Name: analysis_standards_logs_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.analysis_standards_logs_type_enum AS ENUM (
    'crm',
    'blank'
);


--
-- Name: qr_codes_logs_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.qr_codes_logs_status_enum AS ENUM (
    'distributed',
    'collected',
    'received',
    'analyzing',
    'analyzed',
    'approved'
);


--
-- Name: results_logs_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.results_logs_recorded_type_enum AS ENUM (
    'scan',
    'file',
    'input'
);


--
-- Name: sample_blank_results_logs_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sample_blank_results_logs_recorded_type_enum AS ENUM (
    'scan',
    'file',
    'input'
);


--
-- Name: sample_blanks_logs_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sample_blanks_logs_type_enum AS ENUM (
    'sample',
    'blank'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analysis_standard_results_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_standard_results_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    analysis_standard_result_id integer NOT NULL,
    analysis_standard_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    repeat_number integer NOT NULL,
    recorded_at bigint,
    recorded_type public.analysis_standard_results_logs_recorded_type_enum,
    recorded_uid integer,
    pre_value numeric(20,12),
    post_value numeric(20,12),
    laboratory_setting_id integer NOT NULL
);


--
-- Name: analysis_standards_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_standards_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "analysisStandardId" integer NOT NULL,
    service_calendar_id integer NOT NULL,
    standard_id integer,
    blank_name character varying(100),
    repeat_count integer NOT NULL,
    type public.analysis_standards_logs_type_enum NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: books_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "bookId" integer NOT NULL,
    qr_code_id integer,
    land_id integer,
    farmer_id integer,
    service_type_id integer,
    booekd_at bigint,
    collect_sample_at bigint,
    latitude numeric(10,6),
    longitude numeric(10,6),
    area_size double precision,
    sample_code character varying(15),
    repeat_count integer,
    sample_received_at bigint,
    sample_received_uid integer,
    sample_analysis_number integer,
    received_service_calendar_id integer,
    analysis_service_calendar_id integer,
    service_area_id integer,
    subdistrict_code character varying(6),
    zip_code integer
);


--
-- Name: buses_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buses_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "busId" integer NOT NULL,
    bus_number character varying(2) NOT NULL,
    bus_name character varying(50) NOT NULL,
    license_plate character varying(45) NOT NULL,
    registration_province_code integer NOT NULL,
    working_area character varying(45) NOT NULL,
    note text,
    updated_uid integer NOT NULL
);


--
-- Name: convert_om_settings_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convert_om_settings_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "convertOmSettingId" integer NOT NULL,
    laboratory_setting_id integer NOT NULL,
    intercept double precision DEFAULT '0.0159'::double precision,
    slope double precision DEFAULT '0.0122'::double precision,
    update_uid integer NOT NULL
);


--
-- Name: factories_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factories_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "factoryId" integer NOT NULL,
    name character varying(100) NOT NULL,
    initial character varying(4) NOT NULL,
    note text,
    update_uid integer NOT NULL,
    audit_event_id uuid,
    action character varying(20)
);


--
-- Name: farmers_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmers_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "farmerId" integer NOT NULL,
    thai_national_id character varying(13),
    thai_farmer_id character varying(45),
    phone character varying(10) NOT NULL,
    first_name character varying(45) NOT NULL,
    last_name character varying(45) NOT NULL,
    line_user_id character varying(100),
    factory_id integer NOT NULL,
    service_area_id integer NOT NULL,
    update_uid integer DEFAULT 1 NOT NULL
);


--
-- Name: fertilizer_major_land_scores_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_major_land_scores_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "fertilizerMajorLandScoreId" integer NOT NULL,
    soil_grade_id integer NOT NULL,
    book_id integer NOT NULL,
    result_id integer,
    soil_grade_level_id integer NOT NULL,
    result_value double precision,
    comment text,
    comment_uid integer,
    updated_uid integer NOT NULL
);


--
-- Name: fertilizer_major_land_usages_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_major_land_usages_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "fertilizerMajorLandUsageId" integer NOT NULL,
    service_fertilizer_major_usage_id integer NOT NULL,
    book_id integer NOT NULL,
    total_score_id integer NOT NULL,
    fertilizer_major_id integer NOT NULL,
    grade integer NOT NULL,
    grade_text character varying(255),
    formula character varying(8),
    use_rate double precision,
    cost_per_rai double precision
);


--
-- Name: fertilizer_majors_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_majors_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "fertilizerMajorId" integer NOT NULL,
    type character varying NOT NULL,
    formular character varying(8) NOT NULL,
    "N" integer NOT NULL,
    "P" integer NOT NULL,
    "K" integer NOT NULL,
    quantity double precision NOT NULL,
    unit_id integer NOT NULL,
    price double precision NOT NULL,
    price_per_unit double precision NOT NULL,
    note text,
    update_uid integer
);


--
-- Name: fertilizer_minor_land_usages_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_minor_land_usages_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "fertilizerMinorLandUsageId" integer NOT NULL,
    service_fertilizer_minor_id integer NOT NULL,
    book_id integer NOT NULL,
    result_id integer NOT NULL,
    level integer NOT NULL,
    fertilizer_minor_id integer NOT NULL,
    result_value double precision,
    fertilizer_minor_name character varying(255),
    use_rate_per_rai double precision,
    total_usage double precision,
    price_per_rai double precision,
    total_price double precision,
    updated_uid integer NOT NULL
);


--
-- Name: fertilizer_minors_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_minors_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "fertilizerMinorId" integer NOT NULL,
    name character varying(100) NOT NULL,
    price_per_unit double precision NOT NULL,
    unit_id integer NOT NULL,
    benefit text NOT NULL,
    note text,
    update_uid integer NOT NULL
);


--
-- Name: laboratories_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratories_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "laboratoryId" integer NOT NULL,
    laboratory_code character varying(45) NOT NULL,
    name character varying(100) NOT NULL,
    short_name_before character varying(30) NOT NULL,
    unit_before character varying(30) NOT NULL,
    short_name_after character varying(30) NOT NULL,
    unit_after character varying(30) NOT NULL,
    range_min double precision NOT NULL,
    range_max double precision NOT NULL,
    machine_type_id integer NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: laboratory_setting_details_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratory_setting_details_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    laboratory_setting_id integer NOT NULL,
    number_of_values integer NOT NULL,
    absorbance double precision NOT NULL,
    working_standard double precision NOT NULL
);


--
-- Name: laboratory_settings_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratory_settings_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "laboratorySettingId" integer NOT NULL,
    laboratory_id integer NOT NULL,
    service_calendar_id integer NOT NULL,
    working_standard double precision,
    r_squared double precision,
    extract_concentration double precision,
    extract_amount double precision,
    intercept double precision,
    slope double precision,
    update_uid integer NOT NULL
);


--
-- Name: lands_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lands_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "landId" integer NOT NULL,
    land_code character varying(45),
    name character varying(45) NOT NULL,
    quota_code character varying(45),
    area_size integer NOT NULL,
    latitude numeric(10,6),
    longitude numeric(10,6),
    subdistrict_code character varying NOT NULL,
    zip_code integer NOT NULL,
    village character varying(45),
    farmer_id integer NOT NULL,
    update_uid integer
);


--
-- Name: machine_types_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_types_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "machineTypeId" integer NOT NULL,
    name character varying(100) NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: qr_code_labs_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_code_labs_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "qrCodeLab" character varying NOT NULL,
    book_id integer NOT NULL,
    printed_at bigint NOT NULL,
    printed_uid integer NOT NULL,
    type character varying NOT NULL
);


--
-- Name: qr_codes_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_codes_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "qrCodeId" integer NOT NULL,
    qr_code character varying NOT NULL,
    created_uid integer NOT NULL,
    type character varying NOT NULL,
    service_area_id integer,
    service_calendar_id integer,
    dirt_weight_om double precision DEFAULT '0.0025'::double precision,
    dirt_weight_mehlich double precision DEFAULT '0.003'::double precision,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(10),
    status public.qr_codes_logs_status_enum DEFAULT 'distributed'::public.qr_codes_logs_status_enum NOT NULL,
    thai_national_id character varying(13),
    land_code character varying(45),
    land_name character varying(45),
    created_at bigint NOT NULL
);


--
-- Name: result_grade_levels_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_grade_levels_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    result_grade_id integer NOT NULL,
    level integer NOT NULL,
    color character varying(7),
    cutoff_value double precision,
    cutoff_text character varying(100),
    score_name character varying(45) NOT NULL
);


--
-- Name: result_grades_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_grades_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "resultGradeId" integer NOT NULL,
    service_type_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    updated_uid integer NOT NULL
);


--
-- Name: results_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "resultId" integer NOT NULL,
    book_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    service_type_id integer,
    repeat_number integer NOT NULL,
    recorded_at bigint,
    recorded_type public.results_logs_recorded_type_enum,
    recorded_uid integer,
    pre_value numeric(20,12),
    post_value numeric(20,12),
    laboratory_setting_id integer NOT NULL,
    result_grade_id integer,
    result_grade_level integer
);


--
-- Name: sample_blank_results_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_blank_results_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "sampleBlankResultId" integer NOT NULL,
    sample_blank_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    repeat_number integer NOT NULL,
    recorded_at bigint NOT NULL,
    recorded_type public.sample_blank_results_logs_recorded_type_enum NOT NULL,
    recorded_uid integer NOT NULL,
    post_value double precision,
    pre_value double precision,
    certificate double precision,
    laboratory_setting_id integer NOT NULL
);


--
-- Name: sample_blanks_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_blanks_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    sample_blank_id integer NOT NULL,
    service_calendar_id integer NOT NULL,
    name character varying(100) NOT NULL,
    "repeatCount" integer NOT NULL,
    type public.sample_blanks_logs_type_enum NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    migration_id character varying(150) NOT NULL,
    database_name character varying(20) NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_areas_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_areas_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceAreaId" integer NOT NULL,
    factory_id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(45) NOT NULL,
    note text,
    update_uid integer NOT NULL,
    audit_event_id uuid,
    action character varying(20)
);


--
-- Name: service_calendars_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_calendars_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceCalendarId" integer NOT NULL,
    date date NOT NULL,
    bus_id integer NOT NULL,
    number_of_samples integer NOT NULL,
    number_of_bookings integer NOT NULL,
    number_of_examinations integer NOT NULL,
    subdistrict_code character varying(6) NOT NULL,
    village character varying(100) NOT NULL,
    latitude numeric(10,6) NOT NULL,
    longitude numeric(10,6) NOT NULL,
    description text,
    update_uid integer NOT NULL
);


--
-- Name: service_categories_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceCategoryId" integer NOT NULL,
    name character varying(100) NOT NULL,
    service_type_id integer NOT NULL,
    is_display boolean DEFAULT true NOT NULL
);


--
-- Name: service_fertilizer_major_usages_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_major_usages_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceFertilizerMajorUsageId" integer NOT NULL,
    service_category_id integer NOT NULL,
    usage_type_id integer NOT NULL,
    soil_grade_level_id integer NOT NULL,
    fertilizer_major_id integer,
    volume numeric(10,2),
    update_uid integer NOT NULL
);


--
-- Name: service_fertilizer_minor_usages_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_minor_usages_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    service_fertilizer_minor_id integer NOT NULL,
    level integer NOT NULL,
    cutoff_value double precision NOT NULL,
    cutoff_text character varying(100) NOT NULL,
    fertilizer_usage_value double precision NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: service_fertilizer_minors_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_minors_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceFertilizerMinorId" integer NOT NULL,
    service_type_id integer NOT NULL,
    fertilizer_minor_id integer NOT NULL,
    laboratory_id integer,
    unit_id integer NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: service_laboratories_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_laboratories_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceTypeId" integer NOT NULL,
    laboratory_id integer NOT NULL,
    is_display boolean DEFAULT true NOT NULL
);


--
-- Name: service_types_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "serviceTypeId" integer NOT NULL,
    name character varying(100) NOT NULL,
    price double precision NOT NULL,
    unit_detail character varying(30) NOT NULL,
    is_display boolean DEFAULT true NOT NULL,
    color character varying NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: shops_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "shopId" integer NOT NULL,
    phone character varying(10) NOT NULL,
    name character varying(45) NOT NULL,
    owner_name character varying(100) NOT NULL,
    facebook character varying(100),
    line_id character varying(100),
    google_map_url character varying(100),
    subdistrict_id character varying(6) NOT NULL,
    zip_code integer NOT NULL,
    created_at bigint NOT NULL,
    image_url character varying(100)
);


--
-- Name: soil_grade_levels_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.soil_grade_levels_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "soilGradeLevelId" integer NOT NULL,
    soil_grade_id integer NOT NULL,
    level integer NOT NULL,
    cutoff_value double precision,
    cutoff_text character varying(45),
    score double precision NOT NULL,
    score_name character varying(45) NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: soil_grades_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.soil_grades_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    soil_grade_id integer NOT NULL,
    service_type_id integer NOT NULL,
    laboratory_id integer,
    parameter character varying(40) NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: soil_grades_logs_soil_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.soil_grades_logs_soil_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: soil_grades_logs_soil_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.soil_grades_logs_soil_grade_id_seq OWNED BY public.soil_grades_logs.soil_grade_id;


--
-- Name: standard_certificates_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standard_certificates_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    standard_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    certificate_value double precision NOT NULL
);


--
-- Name: standards_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standards_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "standardId" integer NOT NULL,
    standard_name character varying(255) NOT NULL,
    updated_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: units_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "unitId" integer NOT NULL,
    name character varying(100) NOT NULL,
    initial character varying(10) NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: usage_types_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_types_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "usageTypeId" integer NOT NULL,
    name character varying(60) NOT NULL,
    update_uid integer NOT NULL
);


--
-- Name: users_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_logs (
    inserted_at bigint NOT NULL,
    deleted_at bigint,
    "userId" integer NOT NULL,
    username character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying NOT NULL,
    department_id integer NOT NULL,
    update_uid integer
);


--
-- Name: soil_grades_logs soil_grade_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs ALTER COLUMN soil_grade_id SET DEFAULT nextval('public.soil_grades_logs_soil_grade_id_seq'::regclass);


--
-- Name: service_fertilizer_minors_logs PK_05fcb3ddc2a5ee89f416297ab6e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors_logs
    ADD CONSTRAINT "PK_05fcb3ddc2a5ee89f416297ab6e" PRIMARY KEY (inserted_at, "serviceFertilizerMinorId");


--
-- Name: users_logs PK_085fe26907dfc49fc92f4fbe486; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_logs
    ADD CONSTRAINT "PK_085fe26907dfc49fc92f4fbe486" PRIMARY KEY (inserted_at, "userId");


--
-- Name: laboratory_settings_logs PK_0de7440a0507f04346084ada758; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings_logs
    ADD CONSTRAINT "PK_0de7440a0507f04346084ada758" PRIMARY KEY (inserted_at, "laboratorySettingId");


--
-- Name: laboratory_setting_details_logs PK_0e0d71df2d44865d99d725129ed; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_setting_details_logs
    ADD CONSTRAINT "PK_0e0d71df2d44865d99d725129ed" PRIMARY KEY (inserted_at, laboratory_setting_id, number_of_values);


--
-- Name: standards_logs PK_13fcc12a53065c2c3948efe4498; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standards_logs
    ADD CONSTRAINT "PK_13fcc12a53065c2c3948efe4498" PRIMARY KEY (inserted_at, "standardId");


--
-- Name: service_areas_logs PK_140ebfd0f50a35f077700eed107; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas_logs
    ADD CONSTRAINT "PK_140ebfd0f50a35f077700eed107" PRIMARY KEY (inserted_at, "serviceAreaId");


--
-- Name: analysis_standards_logs PK_18bce9cd3a4d2244ac1eb6aa834; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards_logs
    ADD CONSTRAINT "PK_18bce9cd3a4d2244ac1eb6aa834" PRIMARY KEY (inserted_at, "analysisStandardId");


--
-- Name: service_calendars_logs PK_20ef690c7b0818662145cf0948b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars_logs
    ADD CONSTRAINT "PK_20ef690c7b0818662145cf0948b" PRIMARY KEY (inserted_at, "serviceCalendarId");


--
-- Name: fertilizer_minor_land_usages_logs PK_276c517c29c29cb6ce1a46c4a45; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages_logs
    ADD CONSTRAINT "PK_276c517c29c29cb6ce1a46c4a45" PRIMARY KEY (inserted_at, "fertilizerMinorLandUsageId");


--
-- Name: soil_grades_logs PK_2d13e8c5b0b910fc8d14a87000c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs
    ADD CONSTRAINT "PK_2d13e8c5b0b910fc8d14a87000c" PRIMARY KEY (inserted_at, soil_grade_id);


--
-- Name: machine_types_logs PK_3238d52a0e338def8f5580243e8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_types_logs
    ADD CONSTRAINT "PK_3238d52a0e338def8f5580243e8" PRIMARY KEY (inserted_at, "machineTypeId");


--
-- Name: farmers_logs PK_3b7f407a2f3812e0bded8859e2a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers_logs
    ADD CONSTRAINT "PK_3b7f407a2f3812e0bded8859e2a" PRIMARY KEY (inserted_at, "farmerId");


--
-- Name: fertilizer_major_land_scores_logs PK_3c2a5909f9f30058955c924d458; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores_logs
    ADD CONSTRAINT "PK_3c2a5909f9f30058955c924d458" PRIMARY KEY (inserted_at, "fertilizerMajorLandScoreId");


--
-- Name: sample_blanks_logs PK_3ca8014f2ccdd3855897a19f1c8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blanks_logs
    ADD CONSTRAINT "PK_3ca8014f2ccdd3855897a19f1c8" PRIMARY KEY (inserted_at, sample_blank_id);


--
-- Name: qr_code_labs_logs PK_41ffd5509cfff8008c73e3f94ec; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_code_labs_logs
    ADD CONSTRAINT "PK_41ffd5509cfff8008c73e3f94ec" PRIMARY KEY (inserted_at, "qrCodeLab");


--
-- Name: soil_grade_levels_logs PK_53eb1beec7a22d5cd0a0dfa0b7e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels_logs
    ADD CONSTRAINT "PK_53eb1beec7a22d5cd0a0dfa0b7e" PRIMARY KEY (inserted_at, "soilGradeLevelId");


--
-- Name: service_categories_logs PK_58df8e36625e4625011a2a6d32b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories_logs
    ADD CONSTRAINT "PK_58df8e36625e4625011a2a6d32b" PRIMARY KEY (inserted_at, "serviceCategoryId");


--
-- Name: service_laboratories_logs PK_5fb1a04741816836bec557b3fb2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_laboratories_logs
    ADD CONSTRAINT "PK_5fb1a04741816836bec557b3fb2" PRIMARY KEY (inserted_at, "serviceTypeId", laboratory_id);


--
-- Name: factories_logs PK_60b9c617311d60ff38d761369d0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factories_logs
    ADD CONSTRAINT "PK_60b9c617311d60ff38d761369d0" PRIMARY KEY (inserted_at, "factoryId");


--
-- Name: convert_om_settings_logs PK_75c2e668ae876376ef96c11554e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convert_om_settings_logs
    ADD CONSTRAINT "PK_75c2e668ae876376ef96c11554e" PRIMARY KEY (inserted_at, "convertOmSettingId");


--
-- Name: analysis_standard_results_logs PK_811e1051dcdfaa610e0d93a8602; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results_logs
    ADD CONSTRAINT "PK_811e1051dcdfaa610e0d93a8602" PRIMARY KEY (inserted_at, analysis_standard_result_id);


--
-- Name: service_fertilizer_major_usages_logs PK_84557ab97f9b992c50556239d8d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages_logs
    ADD CONSTRAINT "PK_84557ab97f9b992c50556239d8d" PRIMARY KEY (inserted_at, "serviceFertilizerMajorUsageId");


--
-- Name: qr_codes_logs PK_896a5426f10def6ea3a2ea0e522; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes_logs
    ADD CONSTRAINT "PK_896a5426f10def6ea3a2ea0e522" PRIMARY KEY (inserted_at, "qrCodeId");


--
-- Name: books_logs PK_89f5e7ba635b32ff65c19a8a4d5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books_logs
    ADD CONSTRAINT "PK_89f5e7ba635b32ff65c19a8a4d5" PRIMARY KEY (inserted_at, "bookId");


--
-- Name: lands_logs PK_8c897a6fb0157c4fc2eab7b0962; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands_logs
    ADD CONSTRAINT "PK_8c897a6fb0157c4fc2eab7b0962" PRIMARY KEY (inserted_at, "landId");


--
-- Name: result_grade_levels_logs PK_8d9a86f8d5cf14ea889ab349919; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grade_levels_logs
    ADD CONSTRAINT "PK_8d9a86f8d5cf14ea889ab349919" PRIMARY KEY (inserted_at, result_grade_id, level);


--
-- Name: service_types_logs PK_8dcf0c164d3df0d9e614c839207; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types_logs
    ADD CONSTRAINT "PK_8dcf0c164d3df0d9e614c839207" PRIMARY KEY (inserted_at, "serviceTypeId");


--
-- Name: laboratories_logs PK_8fd3fcdf615df4c39ddc7d93c60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories_logs
    ADD CONSTRAINT "PK_8fd3fcdf615df4c39ddc7d93c60" PRIMARY KEY (inserted_at, "laboratoryId");


--
-- Name: fertilizer_major_land_usages_logs PK_9a7a47680318069b0f139f8e848; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages_logs
    ADD CONSTRAINT "PK_9a7a47680318069b0f139f8e848" PRIMARY KEY (inserted_at, "fertilizerMajorLandUsageId");


--
-- Name: units_logs PK_9f1497c8856593089203b92ab69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_logs
    ADD CONSTRAINT "PK_9f1497c8856593089203b92ab69" PRIMARY KEY (inserted_at, "unitId");


--
-- Name: sample_blank_results_logs PK_c2b3eb1a450332d5cde9a6a15ef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results_logs
    ADD CONSTRAINT "PK_c2b3eb1a450332d5cde9a6a15ef" PRIMARY KEY (inserted_at, "sampleBlankResultId");


--
-- Name: shops_logs PK_ca892c54d33d5d8d4539546f8b1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops_logs
    ADD CONSTRAINT "PK_ca892c54d33d5d8d4539546f8b1" PRIMARY KEY (inserted_at, "shopId");


--
-- Name: result_grades_logs PK_cafe34248e68654b5e7167a29d7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades_logs
    ADD CONSTRAINT "PK_cafe34248e68654b5e7167a29d7" PRIMARY KEY (inserted_at, "resultGradeId");


--
-- Name: usage_types_logs PK_d7d8168a92d665a2e0380e1f41f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types_logs
    ADD CONSTRAINT "PK_d7d8168a92d665a2e0380e1f41f" PRIMARY KEY (inserted_at, "usageTypeId");


--
-- Name: service_fertilizer_minor_usages_logs PK_da371ed9d3f247ecf878dbdd4eb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minor_usages_logs
    ADD CONSTRAINT "PK_da371ed9d3f247ecf878dbdd4eb" PRIMARY KEY (inserted_at, service_fertilizer_minor_id, level);


--
-- Name: fertilizer_majors_logs PK_df49616fe52976acb9fc95062ce; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors_logs
    ADD CONSTRAINT "PK_df49616fe52976acb9fc95062ce" PRIMARY KEY (inserted_at, "fertilizerMajorId");


--
-- Name: fertilizer_minors_logs PK_e1f1f25b00bf52a9d9d5aa86b08; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minors_logs
    ADD CONSTRAINT "PK_e1f1f25b00bf52a9d9d5aa86b08" PRIMARY KEY (inserted_at, "fertilizerMinorId");


--
-- Name: standard_certificates_logs PK_e322dbfd5e5a0ce4ff4c5ec005f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_certificates_logs
    ADD CONSTRAINT "PK_e322dbfd5e5a0ce4ff4c5ec005f" PRIMARY KEY (inserted_at, standard_id, laboratory_id);


--
-- Name: results_logs PK_f005fd1f6da05099c75450ae16f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results_logs
    ADD CONSTRAINT "PK_f005fd1f6da05099c75450ae16f" PRIMARY KEY (inserted_at, "resultId");


--
-- Name: buses_logs PK_f9a2ebda087b5833c49d9ccfb2a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses_logs
    ADD CONSTRAINT "PK_f9a2ebda087b5833c49d9ccfb2a" PRIMARY KEY (inserted_at, "busId");


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (migration_id, database_name);


--
-- Name: analysis_standards_logs unique_analysis_standard_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards_logs
    ADD CONSTRAINT unique_analysis_standard_logs UNIQUE (service_calendar_id, standard_id, blank_name);


--
-- Name: units_logs unique_name_log; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_logs
    ADD CONSTRAINT unique_name_log UNIQUE (name);


--
-- Name: soil_grades_logs unique_service_type_laboratory_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs
    ADD CONSTRAINT unique_service_type_laboratory_logs UNIQUE (service_type_id, laboratory_id);


--
-- Name: usage_types_logs unique_usage_type_log; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types_logs
    ADD CONSTRAINT unique_usage_type_log UNIQUE (name);


--
-- Name: IDX_0474c05900f0368ad79a9d9ab7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0474c05900f0368ad79a9d9ab7" ON public.fertilizer_major_land_scores_logs USING btree (deleted_at);


--
-- Name: IDX_056269bc1ca6ec65459c13207a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_056269bc1ca6ec65459c13207a" ON public.service_fertilizer_minors_logs USING btree (deleted_at);


--
-- Name: IDX_15bf82a221070ac1fa1219a7cc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_15bf82a221070ac1fa1219a7cc" ON public.service_laboratories_logs USING btree (deleted_at);


--
-- Name: IDX_15f70724ec90a9f2d050747353; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_15f70724ec90a9f2d050747353" ON public.service_types_logs USING btree (deleted_at);


--
-- Name: IDX_1c14bc1ba9ddd3dc0f2ae677eb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1c14bc1ba9ddd3dc0f2ae677eb" ON public.result_grade_levels_logs USING btree (deleted_at);


--
-- Name: IDX_220af1fcfc12619fdecc21e61d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_220af1fcfc12619fdecc21e61d" ON public.standards_logs USING btree (deleted_at);


--
-- Name: IDX_22fb6cb2487963d4e30f8d0523; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_22fb6cb2487963d4e30f8d0523" ON public.farmers_logs USING btree (deleted_at);


--
-- Name: IDX_252506d71026987cc88a305365; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_252506d71026987cc88a305365" ON public.standard_certificates_logs USING btree (deleted_at);


--
-- Name: IDX_2cac0ce3fdab3abab85d77e644; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2cac0ce3fdab3abab85d77e644" ON public.soil_grades_logs USING btree (deleted_at);


--
-- Name: IDX_2f3c1b386df0cb79b1e6636fcd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2f3c1b386df0cb79b1e6636fcd" ON public.laboratories_logs USING btree (deleted_at);


--
-- Name: IDX_48d86d39e40a05209ca765e317; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_48d86d39e40a05209ca765e317" ON public.sample_blank_results_logs USING btree (deleted_at);


--
-- Name: IDX_54c51529602a8b19033bf87576; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_54c51529602a8b19033bf87576" ON public.service_areas_logs USING btree (deleted_at);


--
-- Name: IDX_601ef1e7d79db05879777f01b0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_601ef1e7d79db05879777f01b0" ON public.qr_code_labs_logs USING btree (deleted_at);


--
-- Name: IDX_61aecb69726be74fe2bb5ed79d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_61aecb69726be74fe2bb5ed79d" ON public.service_fertilizer_major_usages_logs USING btree (deleted_at);


--
-- Name: IDX_62ecbc4f0c39868200e18f3fcc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_62ecbc4f0c39868200e18f3fcc" ON public.service_fertilizer_minor_usages_logs USING btree (deleted_at);


--
-- Name: IDX_63cc45c95a2862ee56985b3bda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_63cc45c95a2862ee56985b3bda" ON public.service_categories_logs USING btree (deleted_at);


--
-- Name: IDX_6aaca80fddc5fbda5ab65ba153; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6aaca80fddc5fbda5ab65ba153" ON public.units_logs USING btree (deleted_at);


--
-- Name: IDX_71e8b57f4fa6f246871f7d792b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_71e8b57f4fa6f246871f7d792b" ON public.fertilizer_majors_logs USING btree (deleted_at);


--
-- Name: IDX_727e2aa79dc386ae1101a6317c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_727e2aa79dc386ae1101a6317c" ON public.shops_logs USING btree (deleted_at);


--
-- Name: IDX_778e45f474e27cdf05423c4dd2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_778e45f474e27cdf05423c4dd2" ON public.qr_codes_logs USING btree (deleted_at);


--
-- Name: IDX_7f4b4fde01a47cdfd9ca2cd5b1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7f4b4fde01a47cdfd9ca2cd5b1" ON public.result_grades_logs USING btree (deleted_at);


--
-- Name: IDX_90dd74ae94e802d3230750dbb7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_90dd74ae94e802d3230750dbb7" ON public.fertilizer_minors_logs USING btree (deleted_at);


--
-- Name: IDX_911184b46eca83a35624c287fc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_911184b46eca83a35624c287fc" ON public.users_logs USING btree (deleted_at);


--
-- Name: IDX_98f2c1f7a68ddbffc717ece97b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_98f2c1f7a68ddbffc717ece97b" ON public.convert_om_settings_logs USING btree (deleted_at);


--
-- Name: IDX_a672d4cfdd85bbedd2b8fb12a8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a672d4cfdd85bbedd2b8fb12a8" ON public.results_logs USING btree (deleted_at);


--
-- Name: IDX_a8413120d28fd3c06f2841bc82; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a8413120d28fd3c06f2841bc82" ON public.laboratory_setting_details_logs USING btree (deleted_at);


--
-- Name: IDX_aae16192577d4ffb235f3b4fae; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_aae16192577d4ffb235f3b4fae" ON public.books_logs USING btree (deleted_at);


--
-- Name: IDX_af339ddd5172f13e0b7de96852; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_af339ddd5172f13e0b7de96852" ON public.fertilizer_minor_land_usages_logs USING btree (deleted_at);


--
-- Name: IDX_b8fe4901b1af0a0bc10bdb1654; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b8fe4901b1af0a0bc10bdb1654" ON public.service_calendars_logs USING btree (deleted_at);


--
-- Name: IDX_ba2674e06fca0366d790de702a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ba2674e06fca0366d790de702a" ON public.analysis_standard_results_logs USING btree (deleted_at);


--
-- Name: IDX_be897c9ed6a05877ed185fe891; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_be897c9ed6a05877ed185fe891" ON public.analysis_standards_logs USING btree (deleted_at);


--
-- Name: IDX_c2c92e6fd6d993bcd49e3de3cf; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c2c92e6fd6d993bcd49e3de3cf" ON public.factories_logs USING btree (deleted_at);


--
-- Name: IDX_c724d69218a711aef4c13dc9de; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c724d69218a711aef4c13dc9de" ON public.laboratory_settings_logs USING btree (deleted_at);


--
-- Name: IDX_d0ab47ef4d0b735ea413374d1a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d0ab47ef4d0b735ea413374d1a" ON public.soil_grade_levels_logs USING btree (deleted_at);


--
-- Name: IDX_d3fb98b4a7b13bb0900b422343; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d3fb98b4a7b13bb0900b422343" ON public.machine_types_logs USING btree (deleted_at);


--
-- Name: IDX_d8c1a083e036b2c59ca5e3326b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d8c1a083e036b2c59ca5e3326b" ON public.buses_logs USING btree (deleted_at);


--
-- Name: IDX_e687f07a1b72c53dceb9ba62f4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e687f07a1b72c53dceb9ba62f4" ON public.sample_blanks_logs USING btree (deleted_at);


--
-- Name: IDX_e7fc73ee3c24fceb22cf619fa6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e7fc73ee3c24fceb22cf619fa6" ON public.lands_logs USING btree (deleted_at);


--
-- Name: IDX_ed553b63b17859cff6b31998ff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ed553b63b17859cff6b31998ff" ON public.usage_types_logs USING btree (deleted_at);


--
-- Name: IDX_f31aa6086c25e736837bcbd070; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f31aa6086c25e736837bcbd070" ON public.fertilizer_major_land_usages_logs USING btree (deleted_at);


--
-- Name: factories_logs_audit_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX factories_logs_audit_event_id_idx ON public.factories_logs USING btree (audit_event_id) WHERE (audit_event_id IS NOT NULL);


--
-- Name: service_areas_logs_audit_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX service_areas_logs_audit_event_id_idx ON public.service_areas_logs USING btree (audit_event_id) WHERE (audit_event_id IS NOT NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict 86p8ZCCGGHPkRGrbKgHkutzIM38pr6YE7X3mOpXbmTQG225I9K8OsGjGYUBQFAg

