--
-- PostgreSQL database dump
--

\restrict Az6Jo1Zn1Lw3vimn9bxSB6nRToFWBDbeZ8qz3LVtVmb0HXO1Dlf4bQCx2oCXiiu

-- Dumped from database version 16.13
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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: analysis_standard_results_logs_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.analysis_standard_results_logs_recorded_type_enum AS ENUM (
    'scan',
    'file',
    'input'
);


--
-- Name: analysis_standard_results_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.analysis_standard_results_recorded_type_enum AS ENUM (
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
-- Name: analysis_standards_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.analysis_standards_type_enum AS ENUM (
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
-- Name: qr_codes_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.qr_codes_status_enum AS ENUM (
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
-- Name: results_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.results_recorded_type_enum AS ENUM (
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
-- Name: sample_blank_results_recorded_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sample_blank_results_recorded_type_enum AS ENUM (
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


--
-- Name: sample_blanks_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sample_blanks_type_enum AS ENUM (
    'sample',
    'blank'
);


--
-- Name: lock_service_area_change_exclusive(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.lock_service_area_change_exclusive() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(742001, OLD.service_area_id);
  RETURN OLD;
END;
$$;


--
-- Name: lock_service_area_reference_shared(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.lock_service_area_reference_shared() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.service_area_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock_shared(742001, NEW.service_area_id);
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analysis_standard_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_standard_results (
    analysis_standard_result_id integer NOT NULL,
    analysis_standard_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    repeat_number integer NOT NULL,
    recorded_at bigint,
    recorded_type public.analysis_standard_results_recorded_type_enum,
    recorded_uid integer,
    pre_value numeric(20,12),
    post_value numeric(20,12),
    laboratory_setting_id integer NOT NULL
);


--
-- Name: analysis_standard_results_analysis_standard_result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analysis_standard_results_analysis_standard_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analysis_standard_results_analysis_standard_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analysis_standard_results_analysis_standard_result_id_seq OWNED BY public.analysis_standard_results.analysis_standard_result_id;


--
-- Name: analysis_standards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_standards (
    analysis_standard_id integer NOT NULL,
    service_calendar_id integer NOT NULL,
    standard_id integer,
    blank_name character varying(100),
    repeat_count integer NOT NULL,
    type public.analysis_standards_type_enum NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: analysis_standards_analysis_standard_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analysis_standards_analysis_standard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analysis_standards_analysis_standard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analysis_standards_analysis_standard_id_seq OWNED BY public.analysis_standards.analysis_standard_id;


--
-- Name: audit_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_outbox (
    audit_event_id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(30) NOT NULL,
    entity_id integer NOT NULL,
    action character varying(20) NOT NULL,
    actor_uid integer NOT NULL,
    before_payload jsonb,
    after_payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_outbox_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    book_id integer NOT NULL,
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
-- Name: books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_book_id_seq OWNED BY public.books.book_id;


--
-- Name: buses_bus_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buses_bus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buses (
    bus_id integer DEFAULT nextval('public.buses_bus_id_seq'::regclass) NOT NULL,
    bus_number character varying(2) NOT NULL,
    bus_name character varying(50) NOT NULL,
    license_plate character varying(45) NOT NULL,
    registration_province_code integer NOT NULL,
    working_area character varying(45) NOT NULL,
    note text,
    updated_at bigint NOT NULL,
    updated_uid integer NOT NULL
);


--
-- Name: convert_om_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convert_om_settings (
    convert_om_setting_id integer NOT NULL,
    laboratory_setting_id integer NOT NULL,
    intercept double precision DEFAULT '0.0159'::double precision,
    slope double precision DEFAULT '0.0122'::double precision,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: convert_om_settings_convert_om_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.convert_om_settings_convert_om_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: convert_om_settings_convert_om_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.convert_om_settings_convert_om_setting_id_seq OWNED BY public.convert_om_settings.convert_om_setting_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    code integer NOT NULL,
    name_th character varying(150) NOT NULL,
    name_en character varying(150) NOT NULL,
    province_code integer NOT NULL
);


--
-- Name: factories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factories (
    factory_id integer NOT NULL,
    name character varying(100) NOT NULL,
    initial character varying(4) NOT NULL,
    note text,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: factories_factory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factories_factory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factories_factory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factories_factory_id_seq OWNED BY public.factories.factory_id;


--
-- Name: farmers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmers (
    farmer_id integer NOT NULL,
    thai_national_id character varying(13),
    thai_farmer_id character varying(45),
    phone character varying(10) NOT NULL,
    first_name character varying(45) NOT NULL,
    last_name character varying(45) NOT NULL,
    line_user_id character varying(100),
    factory_id integer NOT NULL,
    service_area_id integer NOT NULL,
    update_uid integer DEFAULT 1 NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: farmers_farmer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmers_farmer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmers_farmer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmers_farmer_id_seq OWNED BY public.farmers.farmer_id;


--
-- Name: fertilizer_major_land_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_major_land_scores (
    fertilizer_major_land_score_id integer NOT NULL,
    soil_grade_id integer NOT NULL,
    book_id integer NOT NULL,
    result_id integer,
    soil_grade_level_id integer NOT NULL,
    result_value double precision,
    comment text,
    comment_uid integer,
    updated_at bigint NOT NULL,
    updated_uid integer NOT NULL
);


--
-- Name: fertilizer_major_land_scores_fertilizer_major_land_score_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fertilizer_major_land_scores_fertilizer_major_land_score_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fertilizer_major_land_scores_fertilizer_major_land_score_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fertilizer_major_land_scores_fertilizer_major_land_score_id_seq OWNED BY public.fertilizer_major_land_scores.fertilizer_major_land_score_id;


--
-- Name: fertilizer_major_land_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_major_land_usages (
    fertilizer_major_land_usage_id integer NOT NULL,
    service_fertilizer_major_usage_id integer NOT NULL,
    book_id integer NOT NULL,
    total_score_id integer NOT NULL,
    fertilizer_major_id integer NOT NULL,
    updated_at bigint NOT NULL,
    grade integer NOT NULL,
    grade_text character varying(255),
    formula character varying(8),
    use_rate double precision,
    cost_per_rai double precision
);


--
-- Name: fertilizer_major_land_usages_fertilizer_major_land_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fertilizer_major_land_usages_fertilizer_major_land_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fertilizer_major_land_usages_fertilizer_major_land_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fertilizer_major_land_usages_fertilizer_major_land_usage_id_seq OWNED BY public.fertilizer_major_land_usages.fertilizer_major_land_usage_id;


--
-- Name: fertilizer_majors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_majors (
    fertilizer_major_id integer NOT NULL,
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
    updated_at bigint NOT NULL,
    update_uid integer
);


--
-- Name: fertilizer_majors_fertilizer_major_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fertilizer_majors_fertilizer_major_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fertilizer_majors_fertilizer_major_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fertilizer_majors_fertilizer_major_id_seq OWNED BY public.fertilizer_majors.fertilizer_major_id;


--
-- Name: fertilizer_minor_land_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_minor_land_usages (
    fertilizer_minor_land_usage_id integer NOT NULL,
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
    updated_uid integer NOT NULL,
    updated_at bigint
);


--
-- Name: fertilizer_minor_land_usages_fertilizer_minor_land_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fertilizer_minor_land_usages_fertilizer_minor_land_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fertilizer_minor_land_usages_fertilizer_minor_land_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fertilizer_minor_land_usages_fertilizer_minor_land_usage_id_seq OWNED BY public.fertilizer_minor_land_usages.fertilizer_minor_land_usage_id;


--
-- Name: fertilizer_minors_fertilizer_minor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fertilizer_minors_fertilizer_minor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fertilizer_minors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fertilizer_minors (
    fertilizer_minor_id integer DEFAULT nextval('public.fertilizer_minors_fertilizer_minor_id_seq'::regclass) NOT NULL,
    name character varying(100) NOT NULL,
    price_per_unit double precision NOT NULL,
    unit_id integer NOT NULL,
    benefit text NOT NULL,
    note text,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: geographies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geographies (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: laboratories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratories (
    laboratory_id integer NOT NULL,
    laboratory_code character varying(45) NOT NULL,
    name character varying(100) NOT NULL,
    short_name_before character varying(30) NOT NULL,
    unit_before character varying(30) NOT NULL,
    short_name_after character varying(30) NOT NULL,
    unit_after character varying(30) NOT NULL,
    range_min double precision NOT NULL,
    range_max double precision NOT NULL,
    machine_type_id integer NOT NULL,
    is_main boolean DEFAULT false NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL,
    is_use_for_grading boolean DEFAULT false NOT NULL
);


--
-- Name: laboratories_laboratory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.laboratories_laboratory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: laboratories_laboratory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.laboratories_laboratory_id_seq OWNED BY public.laboratories.laboratory_id;


--
-- Name: laboratory_setting_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratory_setting_details (
    laboratory_setting_id integer NOT NULL,
    number_of_values integer NOT NULL,
    absorbance double precision NOT NULL,
    working_standard double precision NOT NULL
);


--
-- Name: laboratory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratory_settings (
    laboratory_setting_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    service_calendar_id integer NOT NULL,
    working_standard double precision,
    r_squared double precision,
    extract_concentration double precision,
    extract_amount double precision,
    intercept double precision,
    slope double precision,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: laboratory_settings_laboratory_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.laboratory_settings_laboratory_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: laboratory_settings_laboratory_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.laboratory_settings_laboratory_setting_id_seq OWNED BY public.laboratory_settings.laboratory_setting_id;


--
-- Name: lands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lands (
    land_id integer NOT NULL,
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
    update_uid integer,
    updated_at bigint NOT NULL
);


--
-- Name: lands_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lands_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lands_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lands_land_id_seq OWNED BY public.lands.land_id;


--
-- Name: machine_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_types (
    machine_type_id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: machine_types_machine_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.machine_types_machine_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: machine_types_machine_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.machine_types_machine_type_id_seq OWNED BY public.machine_types.machine_type_id;


--
-- Name: provinces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provinces (
    code integer NOT NULL,
    name_th character varying(150) NOT NULL,
    name_th_short character varying(10) NOT NULL,
    name_en character varying(150) NOT NULL,
    geography_id integer NOT NULL
);


--
-- Name: qr_code_labs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_code_labs (
    qr_code_lab character varying NOT NULL,
    book_id integer NOT NULL,
    printed_at bigint NOT NULL,
    printed_uid integer NOT NULL,
    type character varying NOT NULL
);


--
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_codes (
    qr_code_id integer NOT NULL,
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
    status public.qr_codes_status_enum DEFAULT 'distributed'::public.qr_codes_status_enum NOT NULL,
    thai_national_id character varying(13),
    land_code character varying(45),
    land_name character varying(45),
    created_at bigint NOT NULL
);


--
-- Name: qr_codes_qr_code_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.qr_codes_qr_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: qr_codes_qr_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.qr_codes_qr_code_id_seq OWNED BY public.qr_codes.qr_code_id;


--
-- Name: result_grade_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_grade_levels (
    result_grade_id integer NOT NULL,
    level integer NOT NULL,
    color character varying(7),
    cutoff_value double precision,
    cutoff_text character varying(100),
    score_name character varying(45) NOT NULL
);


--
-- Name: result_grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_grades (
    result_grade_id integer NOT NULL,
    service_type_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    updated_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: result_grades_result_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.result_grades_result_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: result_grades_result_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.result_grades_result_grade_id_seq OWNED BY public.result_grades.result_grade_id;


--
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    result_id integer NOT NULL,
    book_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    service_type_id integer,
    repeat_number integer NOT NULL,
    recorded_at bigint,
    recorded_type public.results_recorded_type_enum,
    recorded_uid integer,
    pre_value numeric(20,12),
    post_value numeric(20,12),
    laboratory_setting_id integer NOT NULL,
    result_grade_id integer,
    result_grade_level integer
);


--
-- Name: results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.results_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: results_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.results_result_id_seq OWNED BY public.results.result_id;


--
-- Name: sample_blank_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_blank_results (
    sample_blank_result_id integer NOT NULL,
    sample_blank_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    repeat_number integer NOT NULL,
    recorded_at bigint NOT NULL,
    recorded_type public.sample_blank_results_recorded_type_enum NOT NULL,
    recorded_uid integer NOT NULL,
    post_value double precision,
    pre_value double precision,
    certificate double precision,
    laboratory_setting_id integer NOT NULL
);


--
-- Name: sample_blank_results_sample_blank_result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sample_blank_results_sample_blank_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sample_blank_results_sample_blank_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sample_blank_results_sample_blank_result_id_seq OWNED BY public.sample_blank_results.sample_blank_result_id;


--
-- Name: sample_blanks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_blanks (
    sample_blank_id integer NOT NULL,
    service_calendar_id integer NOT NULL,
    name character varying(100) NOT NULL,
    "repeatCount" integer NOT NULL,
    type public.sample_blanks_type_enum NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: sample_blanks_sample_blank_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sample_blanks_sample_blank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sample_blanks_sample_blank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sample_blanks_sample_blank_id_seq OWNED BY public.sample_blanks.sample_blank_id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    migration_id character varying(150) NOT NULL,
    database_name character varying(20) NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_areas (
    service_area_id integer NOT NULL,
    factory_id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(45) NOT NULL,
    note text,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_areas_service_area_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_areas_service_area_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_areas_service_area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_areas_service_area_id_seq OWNED BY public.service_areas.service_area_id;


--
-- Name: service_calendars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_calendars (
    service_calendar_id integer NOT NULL,
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
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_calendars_service_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_calendars_service_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_calendars_service_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_calendars_service_calendar_id_seq OWNED BY public.service_calendars.service_calendar_id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    service_category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    service_type_id integer NOT NULL,
    is_display boolean DEFAULT true NOT NULL
);


--
-- Name: service_categories_service_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_categories_service_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_categories_service_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_categories_service_category_id_seq OWNED BY public.service_categories.service_category_id;


--
-- Name: service_fertilizer_major_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_major_usages (
    service_fertilizer_major_usage_id integer NOT NULL,
    service_category_id integer NOT NULL,
    usage_type_id integer NOT NULL,
    soil_grade_level_id integer NOT NULL,
    fertilizer_major_id integer,
    volume numeric(10,2),
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_fertilizer_major_usag_service_fertilizer_major_usag_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_fertilizer_major_usag_service_fertilizer_major_usag_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_fertilizer_major_usag_service_fertilizer_major_usag_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_fertilizer_major_usag_service_fertilizer_major_usag_seq OWNED BY public.service_fertilizer_major_usages.service_fertilizer_major_usage_id;


--
-- Name: service_fertilizer_minor_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_minor_usages (
    service_fertilizer_minor_id integer NOT NULL,
    level integer NOT NULL,
    cutoff_value double precision NOT NULL,
    cutoff_text character varying(100) NOT NULL,
    fertilizer_usage_value double precision NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_fertilizer_minors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_fertilizer_minors (
    service_fertilizer_minor_id integer NOT NULL,
    service_type_id integer NOT NULL,
    fertilizer_minor_id integer NOT NULL,
    laboratory_id integer,
    unit_id integer NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_fertilizer_minors_service_fertilizer_minor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_fertilizer_minors_service_fertilizer_minor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_fertilizer_minors_service_fertilizer_minor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_fertilizer_minors_service_fertilizer_minor_id_seq OWNED BY public.service_fertilizer_minors.service_fertilizer_minor_id;


--
-- Name: service_laboratories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_laboratories (
    service_type_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    is_display boolean DEFAULT true NOT NULL
);


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    service_type_id integer NOT NULL,
    name character varying(100) NOT NULL,
    price double precision NOT NULL,
    unit_detail character varying(30) NOT NULL,
    is_display boolean DEFAULT true NOT NULL,
    color character varying NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: service_types_service_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_types_service_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_types_service_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_types_service_type_id_seq OWNED BY public.service_types.service_type_id;


--
-- Name: shops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops (
    shop_id integer NOT NULL,
    phone character varying(10) NOT NULL,
    name character varying(45) NOT NULL,
    owner_name character varying(100) NOT NULL,
    facebook character varying(100),
    line_id character varying(100),
    google_map_url character varying(100),
    subdistrict_id character varying(6) NOT NULL,
    zip_code integer NOT NULL,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL,
    update_uid integer,
    latitude numeric(10,6),
    longitude numeric(10,6),
    image_url character varying(100)
);


--
-- Name: shops_shop_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shops_shop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shops_shop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shops_shop_id_seq OWNED BY public.shops.shop_id;


--
-- Name: soil_grade_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.soil_grade_levels (
    soil_grade_level_id integer NOT NULL,
    soil_grade_id integer NOT NULL,
    level integer NOT NULL,
    cutoff_value double precision,
    cutoff_text character varying(45),
    score double precision NOT NULL,
    score_name character varying(45) NOT NULL,
    update_uid integer NOT NULL,
    "updatedAt" bigint NOT NULL
);


--
-- Name: soil_grade_levels_soil_grade_level_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.soil_grade_levels_soil_grade_level_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: soil_grade_levels_soil_grade_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.soil_grade_levels_soil_grade_level_id_seq OWNED BY public.soil_grade_levels.soil_grade_level_id;


--
-- Name: soil_grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.soil_grades (
    soil_grade_id integer NOT NULL,
    service_type_id integer NOT NULL,
    laboratory_id integer,
    parameter character varying(40) NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
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
-- Name: soil_grades_soil_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.soil_grades_soil_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: soil_grades_soil_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.soil_grades_soil_grade_id_seq OWNED BY public.soil_grades.soil_grade_id;


--
-- Name: standard_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standard_certificates (
    standard_id integer NOT NULL,
    laboratory_id integer NOT NULL,
    certificate_value double precision NOT NULL
);


--
-- Name: standards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standards (
    standard_id integer NOT NULL,
    standard_name character varying(255) NOT NULL,
    updated_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: standards_standard_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.standards_standard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: standards_standard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.standards_standard_id_seq OWNED BY public.standards.standard_id;


--
-- Name: subdistricts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subdistricts (
    code character varying(6) NOT NULL,
    zip_code integer NOT NULL,
    name_th character varying(150) NOT NULL,
    name_en character varying(150) NOT NULL,
    district_code integer NOT NULL,
    latitude numeric(10,6),
    longitude numeric(10,6)
);


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    unit_id integer NOT NULL,
    name character varying(100) NOT NULL,
    initial character varying(10) NOT NULL,
    update_uid integer NOT NULL,
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
-- Name: units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_unit_id_seq OWNED BY public.units.unit_id;


--
-- Name: usage_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_types (
    usage_type_id integer NOT NULL,
    name character varying(60) NOT NULL,
    update_uid integer NOT NULL,
    updated_at bigint NOT NULL
);


--
-- Name: usage_types_usage_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usage_types_usage_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usage_types_usage_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usage_types_usage_type_id_seq OWNED BY public.usage_types.usage_type_id;


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer DEFAULT nextval('public.users_user_id_seq'::regclass) NOT NULL,
    username character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying NOT NULL,
    department_id integer NOT NULL,
    update_uid integer,
    updated_at bigint NOT NULL
);


--
-- Name: analysis_standard_results analysis_standard_result_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results ALTER COLUMN analysis_standard_result_id SET DEFAULT nextval('public.analysis_standard_results_analysis_standard_result_id_seq'::regclass);


--
-- Name: analysis_standards analysis_standard_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards ALTER COLUMN analysis_standard_id SET DEFAULT nextval('public.analysis_standards_analysis_standard_id_seq'::regclass);


--
-- Name: books book_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN book_id SET DEFAULT nextval('public.books_book_id_seq'::regclass);


--
-- Name: convert_om_settings convert_om_setting_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convert_om_settings ALTER COLUMN convert_om_setting_id SET DEFAULT nextval('public.convert_om_settings_convert_om_setting_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: factories factory_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factories ALTER COLUMN factory_id SET DEFAULT nextval('public.factories_factory_id_seq'::regclass);


--
-- Name: farmers farmer_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers ALTER COLUMN farmer_id SET DEFAULT nextval('public.farmers_farmer_id_seq'::regclass);


--
-- Name: fertilizer_major_land_scores fertilizer_major_land_score_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores ALTER COLUMN fertilizer_major_land_score_id SET DEFAULT nextval('public.fertilizer_major_land_scores_fertilizer_major_land_score_id_seq'::regclass);


--
-- Name: fertilizer_major_land_usages fertilizer_major_land_usage_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages ALTER COLUMN fertilizer_major_land_usage_id SET DEFAULT nextval('public.fertilizer_major_land_usages_fertilizer_major_land_usage_id_seq'::regclass);


--
-- Name: fertilizer_majors fertilizer_major_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors ALTER COLUMN fertilizer_major_id SET DEFAULT nextval('public.fertilizer_majors_fertilizer_major_id_seq'::regclass);


--
-- Name: fertilizer_minor_land_usages fertilizer_minor_land_usage_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages ALTER COLUMN fertilizer_minor_land_usage_id SET DEFAULT nextval('public.fertilizer_minor_land_usages_fertilizer_minor_land_usage_id_seq'::regclass);


--
-- Name: laboratories laboratory_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories ALTER COLUMN laboratory_id SET DEFAULT nextval('public.laboratories_laboratory_id_seq'::regclass);


--
-- Name: laboratory_settings laboratory_setting_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings ALTER COLUMN laboratory_setting_id SET DEFAULT nextval('public.laboratory_settings_laboratory_setting_id_seq'::regclass);


--
-- Name: lands land_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands ALTER COLUMN land_id SET DEFAULT nextval('public.lands_land_id_seq'::regclass);


--
-- Name: machine_types machine_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_types ALTER COLUMN machine_type_id SET DEFAULT nextval('public.machine_types_machine_type_id_seq'::regclass);


--
-- Name: qr_codes qr_code_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes ALTER COLUMN qr_code_id SET DEFAULT nextval('public.qr_codes_qr_code_id_seq'::regclass);


--
-- Name: result_grades result_grade_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades ALTER COLUMN result_grade_id SET DEFAULT nextval('public.result_grades_result_grade_id_seq'::regclass);


--
-- Name: results result_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results ALTER COLUMN result_id SET DEFAULT nextval('public.results_result_id_seq'::regclass);


--
-- Name: sample_blank_results sample_blank_result_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results ALTER COLUMN sample_blank_result_id SET DEFAULT nextval('public.sample_blank_results_sample_blank_result_id_seq'::regclass);


--
-- Name: sample_blanks sample_blank_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blanks ALTER COLUMN sample_blank_id SET DEFAULT nextval('public.sample_blanks_sample_blank_id_seq'::regclass);


--
-- Name: service_areas service_area_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas ALTER COLUMN service_area_id SET DEFAULT nextval('public.service_areas_service_area_id_seq'::regclass);


--
-- Name: service_calendars service_calendar_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars ALTER COLUMN service_calendar_id SET DEFAULT nextval('public.service_calendars_service_calendar_id_seq'::regclass);


--
-- Name: service_categories service_category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN service_category_id SET DEFAULT nextval('public.service_categories_service_category_id_seq'::regclass);


--
-- Name: service_fertilizer_major_usages service_fertilizer_major_usage_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages ALTER COLUMN service_fertilizer_major_usage_id SET DEFAULT nextval('public.service_fertilizer_major_usag_service_fertilizer_major_usag_seq'::regclass);


--
-- Name: service_fertilizer_minors service_fertilizer_minor_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors ALTER COLUMN service_fertilizer_minor_id SET DEFAULT nextval('public.service_fertilizer_minors_service_fertilizer_minor_id_seq'::regclass);


--
-- Name: service_types service_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types ALTER COLUMN service_type_id SET DEFAULT nextval('public.service_types_service_type_id_seq'::regclass);


--
-- Name: shops shop_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops ALTER COLUMN shop_id SET DEFAULT nextval('public.shops_shop_id_seq'::regclass);


--
-- Name: soil_grade_levels soil_grade_level_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels ALTER COLUMN soil_grade_level_id SET DEFAULT nextval('public.soil_grade_levels_soil_grade_level_id_seq'::regclass);


--
-- Name: soil_grades soil_grade_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades ALTER COLUMN soil_grade_id SET DEFAULT nextval('public.soil_grades_soil_grade_id_seq'::regclass);


--
-- Name: soil_grades_logs soil_grade_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs ALTER COLUMN soil_grade_id SET DEFAULT nextval('public.soil_grades_logs_soil_grade_id_seq'::regclass);


--
-- Name: standards standard_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standards ALTER COLUMN standard_id SET DEFAULT nextval('public.standards_standard_id_seq'::regclass);


--
-- Name: units unit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units ALTER COLUMN unit_id SET DEFAULT nextval('public.units_unit_id_seq'::regclass);


--
-- Name: usage_types usage_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types ALTER COLUMN usage_type_id SET DEFAULT nextval('public.usage_types_usage_type_id_seq'::regclass);


--
-- Name: buses PK_19024b34d336454690bcc2af077; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT "PK_19024b34d336454690bcc2af077" PRIMARY KEY (bus_id);


--
-- Name: departments PK_202cd845b076ed15836884084eb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "PK_202cd845b076ed15836884084eb" PRIMARY KEY (department_id);


--
-- Name: service_types PK_267af3eb7d6ac810fd407e7e7e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT "PK_267af3eb7d6ac810fd407e7e7e2" PRIMARY KEY (service_type_id);


--
-- Name: service_fertilizer_minors PK_2719510b2b959c7ff918a3814a2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "PK_2719510b2b959c7ff918a3814a2" PRIMARY KEY (service_fertilizer_minor_id);


--
-- Name: soil_grade_levels PK_2bc5b2de364bea1d90b181add5e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels
    ADD CONSTRAINT "PK_2bc5b2de364bea1d90b181add5e" PRIMARY KEY (soil_grade_level_id);


--
-- Name: soil_grades_logs PK_2d13e8c5b0b910fc8d14a87000c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs
    ADD CONSTRAINT "PK_2d13e8c5b0b910fc8d14a87000c" PRIMARY KEY (inserted_at, soil_grade_id);


--
-- Name: sample_blank_results PK_38306ceee50fda30ea70616d920; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results
    ADD CONSTRAINT "PK_38306ceee50fda30ea70616d920" PRIMARY KEY (sample_blank_result_id);


--
-- Name: results PK_3c8f50c2bb1131ae2acc86bb48e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "PK_3c8f50c2bb1131ae2acc86bb48e" PRIMARY KEY (result_id);


--
-- Name: usage_types PK_40e08e5f2168c33eb8c445efe75; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types
    ADD CONSTRAINT "PK_40e08e5f2168c33eb8c445efe75" PRIMARY KEY (usage_type_id);


--
-- Name: laboratories PK_41f9eadc5c2206af41e417462e0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT "PK_41f9eadc5c2206af41e417462e0" PRIMARY KEY (laboratory_id);


--
-- Name: laboratory_setting_details PK_45073c8c0ef6080bed336887892; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_setting_details
    ADD CONSTRAINT "PK_45073c8c0ef6080bed336887892" PRIMARY KEY (laboratory_setting_id, number_of_values);


--
-- Name: fertilizer_majors PK_4c9cd35699dd520b9af80cd47a0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors
    ADD CONSTRAINT "PK_4c9cd35699dd520b9af80cd47a0" PRIMARY KEY (fertilizer_major_id);


--
-- Name: fertilizer_minors PK_4d5e48c0e9e40ac5fce316f1dc3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minors
    ADD CONSTRAINT "PK_4d5e48c0e9e40ac5fce316f1dc3" PRIMARY KEY (fertilizer_minor_id);


--
-- Name: service_calendars PK_4d82ff2827e2bdd3634ff382fad; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT "PK_4d82ff2827e2bdd3634ff382fad" PRIMARY KEY (service_calendar_id);


--
-- Name: books PK_552bd343dabd693159e284fe517; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "PK_552bd343dabd693159e284fe517" PRIMARY KEY (book_id);


--
-- Name: laboratory_settings PK_5b90258ca2aeb2b3afbe3a54c4d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings
    ADD CONSTRAINT "PK_5b90258ca2aeb2b3afbe3a54c4d" PRIMARY KEY (laboratory_setting_id);


--
-- Name: units PK_5cef2f225de998fb92c007f0cae; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT "PK_5cef2f225de998fb92c007f0cae" PRIMARY KEY (unit_id);


--
-- Name: factories PK_6546efb4f1c7a8f779d9b18daf5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT "PK_6546efb4f1c7a8f779d9b18daf5" PRIMARY KEY (factory_id);


--
-- Name: service_fertilizer_minor_usages PK_6da48876c921e816128574289bc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minor_usages
    ADD CONSTRAINT "PK_6da48876c921e816128574289bc" PRIMARY KEY (service_fertilizer_minor_id, level);


--
-- Name: result_grade_levels PK_703e8757f66963a3027a984ffab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grade_levels
    ADD CONSTRAINT "PK_703e8757f66963a3027a984ffab" PRIMARY KEY (result_grade_id, level);


--
-- Name: service_fertilizer_major_usages PK_72bcd54577e7f29be10355d8428; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "PK_72bcd54577e7f29be10355d8428" PRIMARY KEY (service_fertilizer_major_usage_id);


--
-- Name: sample_blanks PK_77335e32ba52000c083bfeb90fc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blanks
    ADD CONSTRAINT "PK_77335e32ba52000c083bfeb90fc" PRIMARY KEY (sample_blank_id);


--
-- Name: qr_code_labs PK_7e52c9788b804f07c459e502ef0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_code_labs
    ADD CONSTRAINT "PK_7e52c9788b804f07c459e502ef0" PRIMARY KEY (qr_code_lab);


--
-- Name: result_grades PK_83ad2e2a11a23ba680c56d15767; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades
    ADD CONSTRAINT "PK_83ad2e2a11a23ba680c56d15767" PRIMARY KEY (result_grade_id);


--
-- Name: lands PK_900248f095c4ed8a82621d4ef37; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT "PK_900248f095c4ed8a82621d4ef37" PRIMARY KEY (land_id);


--
-- Name: analysis_standard_results PK_969fa58062aed5b842aa1abf5a7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results
    ADD CONSTRAINT "PK_969fa58062aed5b842aa1abf5a7" PRIMARY KEY (analysis_standard_result_id);


--
-- Name: users PK_96aac72f1574b88752e9fb00089; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY (user_id);


--
-- Name: service_categories PK_96aff58e1a8547d79028f954ad0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT "PK_96aff58e1a8547d79028f954ad0" PRIMARY KEY (service_category_id);


--
-- Name: units_logs PK_9f1497c8856593089203b92ab69; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_logs
    ADD CONSTRAINT "PK_9f1497c8856593089203b92ab69" PRIMARY KEY (inserted_at, "unitId");


--
-- Name: shops PK_a1c960b70b4f013a3b57238b58d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "PK_a1c960b70b4f013a3b57238b58d" PRIMARY KEY (shop_id);


--
-- Name: standards PK_a30b7e51a0653701b00c6092ee7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standards
    ADD CONSTRAINT "PK_a30b7e51a0653701b00c6092ee7" PRIMARY KEY (standard_id);


--
-- Name: soil_grades PK_aacaff0f566e777a6501ff28af8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades
    ADD CONSTRAINT "PK_aacaff0f566e777a6501ff28af8" PRIMARY KEY (soil_grade_id);


--
-- Name: farmers PK_ae337a1f2559a3710b0ed3ac6a8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT "PK_ae337a1f2559a3710b0ed3ac6a8" PRIMARY KEY (farmer_id);


--
-- Name: fertilizer_minor_land_usages PK_c12b41e49224ed39f68130feba7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "PK_c12b41e49224ed39f68130feba7" PRIMARY KEY (fertilizer_minor_land_usage_id);


--
-- Name: service_laboratories PK_c1a6c18913b2536228392dc0f10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_laboratories
    ADD CONSTRAINT "PK_c1a6c18913b2536228392dc0f10" PRIMARY KEY (service_type_id, laboratory_id);


--
-- Name: service_areas PK_c4e6088851a3cfab1cb81c03233; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT "PK_c4e6088851a3cfab1cb81c03233" PRIMARY KEY (service_area_id);


--
-- Name: fertilizer_major_land_usages PK_c50c8195a14cc115d0ce62937d6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT "PK_c50c8195a14cc115d0ce62937d6" PRIMARY KEY (fertilizer_major_land_usage_id);


--
-- Name: analysis_standards PK_c737b33e308f51b9c87282f43fe; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards
    ADD CONSTRAINT "PK_c737b33e308f51b9c87282f43fe" PRIMARY KEY (analysis_standard_id);


--
-- Name: convert_om_settings PK_c83db6718a9c1f838b376052ef7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convert_om_settings
    ADD CONSTRAINT "PK_c83db6718a9c1f838b376052ef7" PRIMARY KEY (convert_om_setting_id);


--
-- Name: qr_codes PK_cee8f612c1d287f04b62414cab0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "PK_cee8f612c1d287f04b62414cab0" PRIMARY KEY (qr_code_id);


--
-- Name: fertilizer_major_land_scores PK_d4b98e0e763f57304fde919fdfb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "PK_d4b98e0e763f57304fde919fdfb" PRIMARY KEY (fertilizer_major_land_score_id);


--
-- Name: standard_certificates PK_e26a7b7e1eb59899a9c4a97e359; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_certificates
    ADD CONSTRAINT "PK_e26a7b7e1eb59899a9c4a97e359" PRIMARY KEY (standard_id, laboratory_id);


--
-- Name: machine_types PK_e2a196578ae4606b9727eb40ae3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_types
    ADD CONSTRAINT "PK_e2a196578ae4606b9727eb40ae3" PRIMARY KEY (machine_type_id);


--
-- Name: books REL_5e087941e73bca73d71fdb6015; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "REL_5e087941e73bca73d71fdb6015" UNIQUE (qr_code_id);


--
-- Name: results UQ_5856c36449a9a73153b24ea5e0a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "UQ_5856c36449a9a73153b24ea5e0a" UNIQUE (book_id, laboratory_id, service_type_id, repeat_number);


--
-- Name: factories UQ_cc4620da8db63adc5e797079e68; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT "UQ_cc4620da8db63adc5e797079e68" UNIQUE (initial);


--
-- Name: service_calendars UQ_d3c378e1dc5450e5e7fe1a1d823; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT "UQ_d3c378e1dc5450e5e7fe1a1d823" UNIQUE (date, bus_id);


--
-- Name: qr_codes UQ_ed6f8820bd83de3f050be02129e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "UQ_ed6f8820bd83de3f050be02129e" UNIQUE (qr_code);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: audit_outbox audit_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_outbox
    ADD CONSTRAINT audit_outbox_pkey PRIMARY KEY (audit_event_id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (code);


--
-- Name: geographies geographies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geographies
    ADD CONSTRAINT geographies_pkey PRIMARY KEY (id);


--
-- Name: lands land_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT land_code UNIQUE (land_code);


--
-- Name: lands owner_land_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT owner_land_name UNIQUE (farmer_id, name);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (code);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (migration_id, database_name);


--
-- Name: fertilizer_major_land_usages ser_fer_major_usage_book; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT ser_fer_major_usage_book UNIQUE (service_fertilizer_major_usage_id, book_id);


--
-- Name: fertilizer_minor_land_usages serv_fer_minor_book; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT serv_fer_minor_book UNIQUE (service_fertilizer_minor_id, book_id);


--
-- Name: fertilizer_major_land_scores soil_grade_book; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT soil_grade_book UNIQUE (soil_grade_id, book_id);


--
-- Name: subdistricts subdistricts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subdistricts
    ADD CONSTRAINT subdistricts_pkey PRIMARY KEY (code);


--
-- Name: analysis_standards unique_analysis_standard; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards
    ADD CONSTRAINT unique_analysis_standard UNIQUE (service_calendar_id, standard_id, blank_name);


--
-- Name: service_areas unique_code_factory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT unique_code_factory UNIQUE (code, factory_id);


--
-- Name: laboratories unique_lab_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT unique_lab_code UNIQUE (laboratory_code);


--
-- Name: units unique_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: units_logs unique_name_log; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_logs
    ADD CONSTRAINT unique_name_log UNIQUE (name);


--
-- Name: service_fertilizer_major_usages unique_service_category_usage_type_soil_grade_level; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT unique_service_category_usage_type_soil_grade_level UNIQUE (service_category_id, usage_type_id, soil_grade_level_id);


--
-- Name: service_fertilizer_minors unique_service_type_fertilizer_minor; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT unique_service_type_fertilizer_minor UNIQUE (service_type_id, fertilizer_minor_id);


--
-- Name: soil_grades unique_service_type_laboratory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades
    ADD CONSTRAINT unique_service_type_laboratory UNIQUE (service_type_id, laboratory_id);


--
-- Name: soil_grades_logs unique_service_type_laboratory_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades_logs
    ADD CONSTRAINT unique_service_type_laboratory_logs UNIQUE (service_type_id, laboratory_id);


--
-- Name: soil_grade_levels unique_soil_grade_level; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels
    ADD CONSTRAINT unique_soil_grade_level UNIQUE (soil_grade_id, level);


--
-- Name: standards unique_standard_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standards
    ADD CONSTRAINT unique_standard_name UNIQUE (standard_name);


--
-- Name: fertilizer_majors unique_type_formular; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors
    ADD CONSTRAINT unique_type_formular UNIQUE (type, formular);


--
-- Name: usage_types unique_usage_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types
    ADD CONSTRAINT unique_usage_type UNIQUE (name);


--
-- Name: IDX_2cac0ce3fdab3abab85d77e644; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2cac0ce3fdab3abab85d77e644" ON public.soil_grades_logs USING btree (deleted_at);


--
-- Name: IDX_6aaca80fddc5fbda5ab65ba153; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6aaca80fddc5fbda5ab65ba153" ON public.units_logs USING btree (deleted_at);


--
-- Name: audit_outbox_pending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_outbox_pending_idx ON public.audit_outbox USING btree (status, created_at);


--
-- Name: books_service_area_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX books_service_area_id_idx ON public.books USING btree (service_area_id);


--
-- Name: farmers_service_area_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX farmers_service_area_id_idx ON public.farmers USING btree (service_area_id);


--
-- Name: idx_books_subdistrict_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_subdistrict_code ON public.books USING btree (subdistrict_code);


--
-- Name: qr_codes_service_area_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX qr_codes_service_area_id_idx ON public.qr_codes USING btree (service_area_id);


--
-- Name: books books_service_area_shared_lock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER books_service_area_shared_lock BEFORE INSERT OR UPDATE OF service_area_id ON public.books FOR EACH ROW EXECUTE FUNCTION public.lock_service_area_reference_shared();


--
-- Name: farmers farmers_service_area_shared_lock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER farmers_service_area_shared_lock BEFORE INSERT OR UPDATE OF service_area_id ON public.farmers FOR EACH ROW EXECUTE FUNCTION public.lock_service_area_reference_shared();


--
-- Name: qr_codes qr_codes_service_area_shared_lock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER qr_codes_service_area_shared_lock BEFORE INSERT OR UPDATE OF service_area_id ON public.qr_codes FOR EACH ROW EXECUTE FUNCTION public.lock_service_area_reference_shared();


--
-- Name: service_areas service_areas_exclusive_lock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER service_areas_exclusive_lock BEFORE DELETE OR UPDATE OF factory_id ON public.service_areas FOR EACH ROW EXECUTE FUNCTION public.lock_service_area_change_exclusive();


--
-- Name: soil_grades FK_0135c19ebee7a4630628cce3f52; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades
    ADD CONSTRAINT "FK_0135c19ebee7a4630628cce3f52" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: users FK_073ef91ff95c22fd8ff02d37226; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_073ef91ff95c22fd8ff02d37226" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: sample_blank_results FK_086d925716ac313060018c339d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results
    ADD CONSTRAINT "FK_086d925716ac313060018c339d6" FOREIGN KEY (laboratory_setting_id) REFERENCES public.laboratory_settings(laboratory_setting_id) ON DELETE CASCADE;


--
-- Name: fertilizer_major_land_scores FK_090334e013eef03374ccb8a3342; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_090334e013eef03374ccb8a3342" FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: users FK_0921d1972cf861d568f5271cd85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: service_fertilizer_major_usages FK_094a28d55ac632727575f9901d7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "FK_094a28d55ac632727575f9901d7" FOREIGN KEY (service_category_id) REFERENCES public.service_categories(service_category_id) ON DELETE CASCADE;


--
-- Name: fertilizer_major_land_usages FK_0ab42af96d53dab6f04252c7dd7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT "FK_0ab42af96d53dab6f04252c7dd7" FOREIGN KEY (total_score_id) REFERENCES public.fertilizer_major_land_scores(fertilizer_major_land_score_id);


--
-- Name: fertilizer_minors FK_0c15da42c22132c389e14e3dcda; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minors
    ADD CONSTRAINT "FK_0c15da42c22132c389e14e3dcda" FOREIGN KEY (unit_id) REFERENCES public.units(unit_id);


--
-- Name: qr_codes FK_0c358d91ccfd8d0bda3a6361dba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "FK_0c358d91ccfd8d0bda3a6361dba" FOREIGN KEY (service_calendar_id) REFERENCES public.service_calendars(service_calendar_id);


--
-- Name: service_types FK_0c46e2e4032454eb6d0edffeece; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT "FK_0c46e2e4032454eb6d0edffeece" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: fertilizer_minor_land_usages FK_138f9b735c39b470432abb89bf0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_138f9b735c39b470432abb89bf0" FOREIGN KEY (service_fertilizer_minor_id, level) REFERENCES public.service_fertilizer_minor_usages(service_fertilizer_minor_id, level);


--
-- Name: service_calendars FK_15bcb4848a0f5f3f88c1e279a53; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT "FK_15bcb4848a0f5f3f88c1e279a53" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: fertilizer_major_land_scores FK_1e4d841ef0ad95d55b920536eba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_1e4d841ef0ad95d55b920536eba" FOREIGN KEY (soil_grade_level_id) REFERENCES public.soil_grade_levels(soil_grade_level_id) ON DELETE SET NULL;


--
-- Name: lands FK_1f325c7956a6638e9788b82ee5d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT "FK_1f325c7956a6638e9788b82ee5d" FOREIGN KEY (subdistrict_code) REFERENCES public.subdistricts(code);


--
-- Name: books FK_205c897e0b1f409d14f53e1ffbc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_205c897e0b1f409d14f53e1ffbc" FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id);


--
-- Name: sample_blanks FK_2157c9f91ded2c60608b2728950; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blanks
    ADD CONSTRAINT "FK_2157c9f91ded2c60608b2728950" FOREIGN KEY (service_calendar_id) REFERENCES public.service_calendars(service_calendar_id) ON DELETE CASCADE;


--
-- Name: books FK_22ad93648fac15e990ad11bedf7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_22ad93648fac15e990ad11bedf7" FOREIGN KEY (land_id) REFERENCES public.lands(land_id);


--
-- Name: service_fertilizer_major_usages FK_265a06c7751febf5fe8f7b44904; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "FK_265a06c7751febf5fe8f7b44904" FOREIGN KEY (soil_grade_level_id) REFERENCES public.soil_grade_levels(soil_grade_level_id);


--
-- Name: analysis_standards FK_31af4471aa2866f9b780c3db978; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards
    ADD CONSTRAINT "FK_31af4471aa2866f9b780c3db978" FOREIGN KEY (standard_id) REFERENCES public.standards(standard_id) ON DELETE CASCADE;


--
-- Name: farmers FK_3514b1c7a33b6494de38e9aaccb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT "FK_3514b1c7a33b6494de38e9aaccb" FOREIGN KEY (factory_id) REFERENCES public.factories(factory_id);


--
-- Name: fertilizer_minor_land_usages FK_392b9e438aa494c8066d6cd643f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_392b9e438aa494c8066d6cd643f" FOREIGN KEY (updated_uid) REFERENCES public.users(user_id);


--
-- Name: service_calendars FK_3a02a0e7efd8723848e8533233e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT "FK_3a02a0e7efd8723848e8533233e" FOREIGN KEY (subdistrict_code) REFERENCES public.subdistricts(code);


--
-- Name: sample_blanks FK_3bf57ea4961fe1ccf78a6859da1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blanks
    ADD CONSTRAINT "FK_3bf57ea4961fe1ccf78a6859da1" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: analysis_standard_results FK_3e3fc96c4febbaa306218984318; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results
    ADD CONSTRAINT "FK_3e3fc96c4febbaa306218984318" FOREIGN KEY (analysis_standard_id) REFERENCES public.analysis_standards(analysis_standard_id) ON DELETE CASCADE;


--
-- Name: soil_grade_levels FK_43881292b70d6bafce3d068e2b5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels
    ADD CONSTRAINT "FK_43881292b70d6bafce3d068e2b5" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: result_grades FK_43f85ad09eb2ffa79318e825a5f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades
    ADD CONSTRAINT "FK_43f85ad09eb2ffa79318e825a5f" FOREIGN KEY (updated_uid) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: laboratory_setting_details FK_46678879626a5e2933abd3fe1c7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_setting_details
    ADD CONSTRAINT "FK_46678879626a5e2933abd3fe1c7" FOREIGN KEY (laboratory_setting_id) REFERENCES public.laboratory_settings(laboratory_setting_id) ON DELETE CASCADE;


--
-- Name: service_categories FK_469a10543dd3d562676423405f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT "FK_469a10543dd3d562676423405f5" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- Name: provinces FK_47c00954bb07daef681c0bf03c9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "FK_47c00954bb07daef681c0bf03c9" FOREIGN KEY (geography_id) REFERENCES public.geographies(id);


--
-- Name: books FK_4b27acd2c5ec84b802fc43a68a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_4b27acd2c5ec84b802fc43a68a3" FOREIGN KEY (received_service_calendar_id) REFERENCES public.service_calendars(service_calendar_id);


--
-- Name: fertilizer_minor_land_usages FK_4b29e0e0a626b8c90d03ae29c45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_4b29e0e0a626b8c90d03ae29c45" FOREIGN KEY (result_id) REFERENCES public.results(result_id);


--
-- Name: fertilizer_majors FK_5014223666cef31bc8e9fa5520b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors
    ADD CONSTRAINT "FK_5014223666cef31bc8e9fa5520b" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: subdistricts FK_5263892afc90e2e0cfba6f37dd8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subdistricts
    ADD CONSTRAINT "FK_5263892afc90e2e0cfba6f37dd8" FOREIGN KEY (district_code) REFERENCES public.districts(code);


--
-- Name: service_laboratories FK_539ca8632b3be3c5e3f44a2af03; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_laboratories
    ADD CONSTRAINT "FK_539ca8632b3be3c5e3f44a2af03" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- Name: fertilizer_major_land_usages FK_56370370132b7bdb7ba61a15036; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT "FK_56370370132b7bdb7ba61a15036" FOREIGN KEY (fertilizer_major_id) REFERENCES public.fertilizer_majors(fertilizer_major_id);


--
-- Name: service_fertilizer_minor_usages FK_563bab015c3f1771dfd347ccff5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minor_usages
    ADD CONSTRAINT "FK_563bab015c3f1771dfd347ccff5" FOREIGN KEY (service_fertilizer_minor_id) REFERENCES public.service_fertilizer_minors(service_fertilizer_minor_id) ON DELETE CASCADE;


--
-- Name: fertilizer_major_land_usages FK_57a50d6b9f2291f1d10dc4d7f6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT "FK_57a50d6b9f2291f1d10dc4d7f6a" FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: farmers FK_5852be1c52bea1c407e08b1370a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT "FK_5852be1c52bea1c407e08b1370a" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: convert_om_settings FK_5d2a52bf2e6fd92b61b8bd4522c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convert_om_settings
    ADD CONSTRAINT "FK_5d2a52bf2e6fd92b61b8bd4522c" FOREIGN KEY (laboratory_setting_id) REFERENCES public.laboratory_settings(laboratory_setting_id) ON DELETE CASCADE;


--
-- Name: books FK_5e087941e73bca73d71fdb60151; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_5e087941e73bca73d71fdb60151" FOREIGN KEY (qr_code_id) REFERENCES public.qr_codes(qr_code_id);


--
-- Name: buses FK_62d3d4d56705973c24d0d4c8f1e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT "FK_62d3d4d56705973c24d0d4c8f1e" FOREIGN KEY (registration_province_code) REFERENCES public.provinces(code);


--
-- Name: service_fertilizer_major_usages FK_686c5f5b807f2bbdc73226aad85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "FK_686c5f5b807f2bbdc73226aad85" FOREIGN KEY (fertilizer_major_id) REFERENCES public.fertilizer_majors(fertilizer_major_id);


--
-- Name: shops FK_6c8d06f01bb1025a1c3a566f0f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "FK_6c8d06f01bb1025a1c3a566f0f4" FOREIGN KEY (subdistrict_id) REFERENCES public.subdistricts(code);


--
-- Name: results FK_70b03aca09d9c2bee769953b768; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "FK_70b03aca09d9c2bee769953b768" FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: result_grade_levels FK_720827fc8980f3063a082927b19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grade_levels
    ADD CONSTRAINT "FK_720827fc8980f3063a082927b19" FOREIGN KEY (result_grade_id) REFERENCES public.result_grades(result_grade_id) ON DELETE CASCADE;


--
-- Name: fertilizer_major_land_usages FK_73632f80f95d3486fc51c90ecab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_usages
    ADD CONSTRAINT "FK_73632f80f95d3486fc51c90ecab" FOREIGN KEY (service_fertilizer_major_usage_id) REFERENCES public.service_fertilizer_major_usages(service_fertilizer_major_usage_id);


--
-- Name: soil_grades FK_75987467a9e83a672287fe36648; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades
    ADD CONSTRAINT "FK_75987467a9e83a672287fe36648" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- Name: fertilizer_majors FK_76c4235bf8faf2c263b799c76df; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_majors
    ADD CONSTRAINT "FK_76c4235bf8faf2c263b799c76df" FOREIGN KEY (unit_id) REFERENCES public.units(unit_id);


--
-- Name: fertilizer_major_land_scores FK_775a692593b1ee1dce2ab2aaa14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_775a692593b1ee1dce2ab2aaa14" FOREIGN KEY (updated_uid) REFERENCES public.users(user_id);


--
-- Name: buses FK_78b26bb3f1b955bae2ea35f67d9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT "FK_78b26bb3f1b955bae2ea35f67d9" FOREIGN KEY (updated_uid) REFERENCES public.users(user_id);


--
-- Name: service_fertilizer_major_usages FK_78d82acef37369bfee7449ed4bd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "FK_78d82acef37369bfee7449ed4bd" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: analysis_standards FK_794b38574f354a663686a75a8da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards
    ADD CONSTRAINT "FK_794b38574f354a663686a75a8da" FOREIGN KEY (service_calendar_id) REFERENCES public.service_calendars(service_calendar_id) ON DELETE CASCADE;


--
-- Name: books FK_7acf349c3a8e44292c1e26cca17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_7acf349c3a8e44292c1e26cca17" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id);


--
-- Name: districts FK_7f4b31875273010908d39850284; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "FK_7f4b31875273010908d39850284" FOREIGN KEY (province_code) REFERENCES public.provinces(code);


--
-- Name: standard_certificates FK_83f9f9ca7ebed40ec54a3ddc7f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_certificates
    ADD CONSTRAINT "FK_83f9f9ca7ebed40ec54a3ddc7f1" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id) ON DELETE CASCADE;


--
-- Name: units FK_873c6fdbd783c0825b74f120743; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT "FK_873c6fdbd783c0825b74f120743" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: service_fertilizer_minor_usages FK_88460134458ce9d00b4f9771bf1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minor_usages
    ADD CONSTRAINT "FK_88460134458ce9d00b4f9771bf1" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: sample_blank_results FK_8e5d5aedc0afcb16b37561b297d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results
    ADD CONSTRAINT "FK_8e5d5aedc0afcb16b37561b297d" FOREIGN KEY (recorded_uid) REFERENCES public.users(user_id);


--
-- Name: laboratory_settings FK_8ed18f153775bb9e587d4281c83; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings
    ADD CONSTRAINT "FK_8ed18f153775bb9e587d4281c83" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: soil_grades FK_8f0ac36b99a00a6c88ba027da9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grades
    ADD CONSTRAINT "FK_8f0ac36b99a00a6c88ba027da9a" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id) ON DELETE CASCADE;


--
-- Name: sample_blank_results FK_903760a725bf408448267568311; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_blank_results
    ADD CONSTRAINT "FK_903760a725bf408448267568311" FOREIGN KEY (sample_blank_id) REFERENCES public.sample_blanks(sample_blank_id) ON DELETE CASCADE;


--
-- Name: usage_types FK_948b577f9f6fd6f333c49071911; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_types
    ADD CONSTRAINT "FK_948b577f9f6fd6f333c49071911" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: laboratories FK_96ac91b5415be9bc0d85bf8a093; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT "FK_96ac91b5415be9bc0d85bf8a093" FOREIGN KEY (machine_type_id) REFERENCES public.machine_types(machine_type_id);


--
-- Name: standards FK_9b2fed248d353fb1d2a04fd809f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standards
    ADD CONSTRAINT "FK_9b2fed248d353fb1d2a04fd809f" FOREIGN KEY (updated_uid) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: results FK_9b759cf624ecec527cb98653a74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "FK_9b759cf624ecec527cb98653a74" FOREIGN KEY (result_grade_id, result_grade_level) REFERENCES public.result_grade_levels(result_grade_id, level) ON DELETE SET NULL;


--
-- Name: service_fertilizer_minors FK_9c8c44b541930389914390c2c20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "FK_9c8c44b541930389914390c2c20" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: result_grades FK_9fac983a50ea0369bb5c0cb9315; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades
    ADD CONSTRAINT "FK_9fac983a50ea0369bb5c0cb9315" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- Name: books FK_a2e7c405ad23bb5ae1879266438; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_a2e7c405ad23bb5ae1879266438" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(service_area_id);


--
-- Name: results FK_a35dc736d93729d2824e8797f0a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "FK_a35dc736d93729d2824e8797f0a" FOREIGN KEY (laboratory_setting_id) REFERENCES public.laboratory_settings(laboratory_setting_id) ON DELETE CASCADE;


--
-- Name: analysis_standards FK_a3d89ed991117071efc0b5fec4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standards
    ADD CONSTRAINT "FK_a3d89ed991117071efc0b5fec4a" FOREIGN KEY (update_uid) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: fertilizer_major_land_scores FK_a6e978e58802733d25fe4d7e802; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_a6e978e58802733d25fe4d7e802" FOREIGN KEY (comment_uid) REFERENCES public.users(user_id);


--
-- Name: fertilizer_major_land_scores FK_a803145a79fa0ffce66a44bff5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_a803145a79fa0ffce66a44bff5c" FOREIGN KEY (result_id) REFERENCES public.results(result_id);


--
-- Name: fertilizer_minor_land_usages FK_a8a19ecc5185a6cc42722d89176; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_a8a19ecc5185a6cc42722d89176" FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: qr_codes FK_a8c8131ac7102e72e58d3e2dee9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "FK_a8c8131ac7102e72e58d3e2dee9" FOREIGN KEY (created_uid) REFERENCES public.users(user_id);


--
-- Name: laboratory_settings FK_abeb024bd337298f0ae31c3dc2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings
    ADD CONSTRAINT "FK_abeb024bd337298f0ae31c3dc2c" FOREIGN KEY (service_calendar_id) REFERENCES public.service_calendars(service_calendar_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lands FK_b34edb4fa3a779578923e50b8f3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT "FK_b34edb4fa3a779578923e50b8f3" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: service_fertilizer_minors FK_b721e9797ffe77657fa923c2fdd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "FK_b721e9797ffe77657fa923c2fdd" FOREIGN KEY (fertilizer_minor_id) REFERENCES public.fertilizer_minors(fertilizer_minor_id) ON DELETE CASCADE;


--
-- Name: analysis_standard_results FK_ba20f53868caef3fafbfffc69bf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results
    ADD CONSTRAINT "FK_ba20f53868caef3fafbfffc69bf" FOREIGN KEY (recorded_uid) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: fertilizer_minor_land_usages FK_bb55a3d135fca710611c8649751; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_bb55a3d135fca710611c8649751" FOREIGN KEY (fertilizer_minor_id) REFERENCES public.fertilizer_minors(fertilizer_minor_id) ON DELETE SET NULL;


--
-- Name: service_laboratories FK_bd6487cbb0e74b9aee554e7cc4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_laboratories
    ADD CONSTRAINT "FK_bd6487cbb0e74b9aee554e7cc4a" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id) ON DELETE CASCADE;


--
-- Name: service_areas FK_bebe087225f5f596a0072a5b09d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT "FK_bebe087225f5f596a0072a5b09d" FOREIGN KEY (factory_id) REFERENCES public.factories(factory_id) ON DELETE CASCADE;


--
-- Name: books FK_c7a555524cd29fabc02bad99bad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_c7a555524cd29fabc02bad99bad" FOREIGN KEY (analysis_service_calendar_id) REFERENCES public.service_calendars(service_calendar_id);


--
-- Name: qr_codes FK_c7ffdf10581692d3c1f310b8e31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "FK_c7ffdf10581692d3c1f310b8e31" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(service_area_id);


--
-- Name: results FK_ca38ac7278a235c6fe1de96fa54; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "FK_ca38ac7278a235c6fe1de96fa54" FOREIGN KEY (recorded_uid) REFERENCES public.users(user_id);


--
-- Name: fertilizer_major_land_scores FK_ce29dc247484a7a5e7c7d83e1a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_major_land_scores
    ADD CONSTRAINT "FK_ce29dc247484a7a5e7c7d83e1a7" FOREIGN KEY (soil_grade_id) REFERENCES public.soil_grades(soil_grade_id);


--
-- Name: service_fertilizer_major_usages FK_ce2b9dcb00c3b17c9871b971f3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_major_usages
    ADD CONSTRAINT "FK_ce2b9dcb00c3b17c9871b971f3f" FOREIGN KEY (usage_type_id) REFERENCES public.usage_types(usage_type_id);


--
-- Name: service_fertilizer_minors FK_ce389d93558b620ef54235e7b4e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "FK_ce389d93558b620ef54235e7b4e" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id);


--
-- Name: fertilizer_minors FK_ceb99ef815e8a66aba0200c191f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minors
    ADD CONSTRAINT "FK_ceb99ef815e8a66aba0200c191f" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: service_calendars FK_cf7d87044fa12d2a29816c78a07; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT "FK_cf7d87044fa12d2a29816c78a07" FOREIGN KEY (bus_id) REFERENCES public.buses(bus_id);


--
-- Name: service_fertilizer_minors FK_d02fd443ff99449167824130e17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "FK_d02fd443ff99449167824130e17" FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- Name: laboratories FK_d1eaaf24944873222f3f66d2596; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratories
    ADD CONSTRAINT "FK_d1eaaf24944873222f3f66d2596" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: service_areas FK_d55e98f4fe8e867350ea6946cc2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT "FK_d55e98f4fe8e867350ea6946cc2" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: service_fertilizer_minors FK_d5df68fff48a36f3c6223b7cbf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_fertilizer_minors
    ADD CONSTRAINT "FK_d5df68fff48a36f3c6223b7cbf2" FOREIGN KEY (unit_id) REFERENCES public.units(unit_id);


--
-- Name: soil_grade_levels FK_d833372026fcabc1f8d39198423; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.soil_grade_levels
    ADD CONSTRAINT "FK_d833372026fcabc1f8d39198423" FOREIGN KEY (soil_grade_id) REFERENCES public.soil_grades(soil_grade_id) ON DELETE CASCADE;


--
-- Name: analysis_standard_results FK_e2913b4ba9342e0e992cdc06416; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_standard_results
    ADD CONSTRAINT "FK_e2913b4ba9342e0e992cdc06416" FOREIGN KEY (laboratory_setting_id) REFERENCES public.laboratory_settings(laboratory_setting_id);


--
-- Name: lands FK_eaa1f318da636451ce2c9a9eab0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lands
    ADD CONSTRAINT "FK_eaa1f318da636451ce2c9a9eab0" FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id);


--
-- Name: convert_om_settings FK_eba3a0f2bbe3af39003a57707a5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convert_om_settings
    ADD CONSTRAINT "FK_eba3a0f2bbe3af39003a57707a5" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: standard_certificates FK_f04041d31d561cfbf69acb43988; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standard_certificates
    ADD CONSTRAINT "FK_f04041d31d561cfbf69acb43988" FOREIGN KEY (standard_id) REFERENCES public.standards(standard_id) ON DELETE CASCADE;


--
-- Name: result_grades FK_f775a0b1375e81a8265948e3f60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_grades
    ADD CONSTRAINT "FK_f775a0b1375e81a8265948e3f60" FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(laboratory_id) ON DELETE CASCADE;


--
-- Name: books FK_f8392b147ef6d78a05ea930066c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT "FK_f8392b147ef6d78a05ea930066c" FOREIGN KEY (sample_received_uid) REFERENCES public.users(user_id);


--
-- Name: fertilizer_minor_land_usages FK_f881e3675af37fcc5d267d2081b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fertilizer_minor_land_usages
    ADD CONSTRAINT "FK_f881e3675af37fcc5d267d2081b" FOREIGN KEY (service_fertilizer_minor_id) REFERENCES public.service_fertilizer_minors(service_fertilizer_minor_id);


--
-- Name: farmers FK_fb58e35c9594f24d5ed3a6aae12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT "FK_fb58e35c9594f24d5ed3a6aae12" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(service_area_id);


--
-- Name: factories FK_fda5c81eecf10b6e46319d3eb4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT "FK_fda5c81eecf10b6e46319d3eb4a" FOREIGN KEY (update_uid) REFERENCES public.users(user_id);


--
-- Name: books books_subdistrict_code_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_subdistrict_code_fk FOREIGN KEY (subdistrict_code) REFERENCES public.subdistricts(code);


--
-- PostgreSQL database dump complete
--

\unrestrict Az6Jo1Zn1Lw3vimn9bxSB6nRToFWBDbeZ8qz3LVtVmb0HXO1Dlf4bQCx2oCXiiu

