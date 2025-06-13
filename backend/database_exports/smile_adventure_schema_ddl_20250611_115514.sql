-- Smile Adventure Database Schema
-- Generated on: 2025-06-11T11:55:14.607392

-- Enum Types
CREATE TYPE userrole AS ENUM ('PARENT', 'PROFESSIONAL', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE userstatus AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- Table: activities
CREATE TABLE activities (
    id integer NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
    child_id integer NOT NULL,
    activity_type character varying(50) NOT NULL,
    activity_name character varying(200) NOT NULL,
    description text,
    category character varying(50),
    points_earned integer NOT NULL,
    difficulty_level integer,
    started_at timestamp with time zone,
    completed_at timestamp with time zone NOT NULL DEFAULT now(),
    duration_minutes integer,
    emotional_state_before character varying(50),
    emotional_state_after character varying(50),
    anxiety_level_before integer,
    anxiety_level_after integer,
    support_level_needed character varying(50),
    support_provided_by character varying(100),
    assistive_technology_used json NOT NULL,
    environment_type character varying(50),
    environmental_modifications json NOT NULL,
    sensory_accommodations json NOT NULL,
    completion_status character varying(50) NOT NULL,
    success_rating integer,
    challenges_encountered json NOT NULL,
    strategies_used json NOT NULL,
    notes text,
    verified_by_parent boolean NOT NULL,
    verified_by_professional boolean NOT NULL,
    verification_notes text,
    created_at timestamp with time zone DEFAULT now(),
    data_source character varying(50) NOT NULL
);

-- Table: alembic_version
CREATE TABLE alembic_version (
    version_num character varying(32) NOT NULL
);

-- Table: assessments
CREATE TABLE assessments (
    id integer NOT NULL DEFAULT nextval('assessments_id_seq'::regclass),
    child_id integer NOT NULL,
    assessment_type character varying(100) NOT NULL,
    assessment_name character varying(200) NOT NULL,
    version character varying(50),
    administered_by character varying(200) NOT NULL,
    administered_date timestamp with time zone NOT NULL,
    location character varying(200),
    raw_scores json,
    standard_scores json,
    percentiles json,
    age_equivalents json,
    interpretation text,
    recommendations json NOT NULL,
    goals_identified json NOT NULL,
    previous_assessment_id integer,
    progress_summary text,
    areas_of_growth json NOT NULL,
    areas_of_concern json NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

-- Table: auth_user_sessions
CREATE TABLE auth_user_sessions (
    id integer NOT NULL DEFAULT nextval('auth_user_sessions_id_seq'::regclass),
    user_id integer NOT NULL,
    session_token character varying(255) NOT NULL,
    refresh_token character varying(255),
    ip_address character varying(45),
    user_agent text,
    device_info text,
    location character varying(200),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    last_accessed_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    is_active boolean NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by integer
);

-- Table: auth_users
CREATE TABLE auth_users (
    id integer NOT NULL DEFAULT nextval('auth_users_id_seq'::regclass),
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    full_name character varying(200),
    phone character varying(20),
    role USER-DEFINED NOT NULL,
    status USER-DEFINED NOT NULL,
    is_active boolean NOT NULL,
    is_verified boolean NOT NULL,
    email_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    failed_login_attempts integer NOT NULL,
    locked_until timestamp with time zone,
    license_number character varying(100),
    specialization character varying(200),
    clinic_name character varying(200),
    clinic_address text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    created_by integer,
    last_modified_by integer,
    timezone character varying(50) NOT NULL,
    language character varying(10) NOT NULL,
    avatar_url character varying(500),
    bio text,
    location character varying(100),
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    preferred_communication character varying(50),
    last_profile_update timestamp with time zone
);

-- Table: children
CREATE TABLE children (
    id integer NOT NULL DEFAULT nextval('children_id_seq'::regclass),
    name character varying(100) NOT NULL,
    age integer NOT NULL,
    date_of_birth timestamp with time zone,
    avatar_url character varying(500),
    parent_id integer NOT NULL,
    points integer NOT NULL,
    level integer NOT NULL,
    achievements json NOT NULL,
    diagnosis character varying(200),
    support_level integer,
    diagnosis_date timestamp with time zone,
    diagnosing_professional character varying(200),
    sensory_profile json,
    behavioral_notes text,
    communication_style character varying(100),
    communication_notes text,
    current_therapies json NOT NULL,
    emergency_contacts json NOT NULL,
    safety_protocols json NOT NULL,
    baseline_assessment json,
    last_assessment_date timestamp with time zone,
    progress_notes json NOT NULL,
    is_active boolean,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone
);

-- Table: game_sessions
CREATE TABLE game_sessions (
    id integer NOT NULL DEFAULT nextval('game_sessions_id_seq'::regclass),
    child_id integer NOT NULL,
    session_type character varying(50) NOT NULL,
    scenario_name character varying(200) NOT NULL,
    scenario_id character varying(100),
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    ended_at timestamp with time zone,
    duration_seconds integer,
    levels_completed integer NOT NULL,
    max_level_reached integer NOT NULL,
    score integer NOT NULL,
    interactions_count integer NOT NULL,
    correct_responses integer NOT NULL,
    help_requests integer NOT NULL,
    emotional_data json,
    interaction_patterns json,
    completion_status character varying(20) NOT NULL,
    exit_reason character varying(100),
    achievement_unlocked json NOT NULL,
    parent_notes text,
    parent_rating integer,
    parent_observed_behavior json,
    device_type character varying(50),
    app_version character varying(20),
    session_data_quality character varying(20) NOT NULL,
    scenario_version character varying(20),
    pause_count integer NOT NULL DEFAULT 0,
    total_pause_duration integer NOT NULL DEFAULT 0,
    incorrect_responses integer NOT NULL DEFAULT 0,
    hint_usage_count integer NOT NULL DEFAULT 0,
    achievements_unlocked json NOT NULL DEFAULT '[]'::json,
    progress_markers_hit json NOT NULL DEFAULT '[]'::json,
    device_model character varying(100),
    environment_type character varying(50),
    support_person_present boolean NOT NULL DEFAULT false,
    ai_analysis json,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone
);

-- Table: password_reset_tokens
CREATE TABLE password_reset_tokens (
    id integer NOT NULL DEFAULT nextval('password_reset_tokens_id_seq'::regclass),
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    is_active boolean NOT NULL
);

-- Table: professional_profiles
CREATE TABLE professional_profiles (
    id integer NOT NULL DEFAULT nextval('professional_profiles_id_seq'::regclass),
    user_id integer NOT NULL,
    license_type character varying(100),
    license_number character varying(100),
    license_state character varying(50),
    license_expiry timestamp with time zone,
    primary_specialty character varying(200),
    subspecialties json NOT NULL,
    certifications json NOT NULL,
    experience_years integer,
    clinic_name character varying(200),
    clinic_address text,
    clinic_phone character varying(20),
    practice_type character varying(100),
    asd_experience_years integer,
    asd_certifications json NOT NULL,
    preferred_age_groups json NOT NULL,
    treatment_approaches json NOT NULL,
    patient_count integer NOT NULL,
    average_rating double precision,
    total_sessions integer NOT NULL,
    available_days json NOT NULL,
    available_hours json,
    accepts_new_patients boolean NOT NULL,
    bio text,
    treatment_philosophy text,
    languages_spoken json NOT NULL,
    is_verified boolean NOT NULL,
    verified_at timestamp with time zone,
    verified_by integer,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    education text,
    availability character varying(50),
    accepts_insurance boolean NOT NULL DEFAULT false,
    consultation_fee numeric(10,2),
    office_address text,
    online_consultation boolean NOT NULL DEFAULT false,
    verification_date timestamp with time zone
);

-- Table: professional_reviews
CREATE TABLE professional_reviews (
    id integer NOT NULL DEFAULT nextval('professional_reviews_id_seq'::regclass),
    professional_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    rating integer NOT NULL,
    review_text text,
    is_anonymous boolean NOT NULL DEFAULT false,
    is_verified boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: user_activity_logs
CREATE TABLE user_activity_logs (
    id integer NOT NULL DEFAULT nextval('user_activity_logs_id_seq'::regclass),
    user_id integer NOT NULL,
    activity_type character varying(50) NOT NULL,
    activity_description text,
    ip_address character varying(45),
    user_agent text,
    timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: user_preferences
CREATE TABLE user_preferences (
    id integer NOT NULL DEFAULT nextval('user_preferences_id_seq'::regclass),
    user_id integer NOT NULL,
    language character varying(10) NOT NULL DEFAULT 'en'::character varying,
    timezone character varying(50) NOT NULL DEFAULT 'UTC'::character varying,
    notifications_enabled boolean NOT NULL DEFAULT true,
    privacy_level character varying(20) NOT NULL DEFAULT 'standard'::character varying,
    theme character varying(20) NOT NULL DEFAULT 'light'::character varying,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

