-- =========================================================================
-- Elderly Care & Medication Management Platform - Supabase PostgreSQL Schema
-- Multi-Patient Care Facility with Seniors, Family Members, and Caretakers
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('senior', 'caretaker', 'family', 'facility_admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'senior',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RESIDENTS / PATIENTS IN CARE FACILITY
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    room_number TEXT NOT NULL,
    wing TEXT NOT NULL, -- e.g. 'Garden View', 'North Wing'
    date_of_birth DATE,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relation TEXT NOT NULL,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CAREGIVER & FAMILY RELATIONSHIP MAPPING
CREATE TABLE caretaker_assignments (
    caretaker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (caretaker_id, resident_id)
);

CREATE TABLE family_links (
    family_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL, -- e.g. 'Daughter', 'Son', 'Spouse'
    receive_missed_dose_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (family_user_id, resident_id)
);

-- 4. MEDICATIONS & PILL IDENTIFIERS
CREATE TYPE pill_shape AS ENUM ('round', 'oval', 'capsule', 'square', 'drop');
CREATE TYPE pill_color AS ENUM ('blue', 'white', 'red', 'yellow', 'orange', 'green', 'pink', 'purple');
CREATE TYPE food_condition AS ENUM ('before_meal', 'with_meal', 'after_meal', 'empty_stomach', 'anytime');

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT NOT NULL, -- e.g. '10 mg', '500 mg'
    form TEXT NOT NULL DEFAULT 'Tablet',
    pill_color pill_color NOT NULL DEFAULT 'white',
    pill_shape pill_shape NOT NULL DEFAULT 'round',
    food_condition food_condition NOT NULL DEFAULT 'anytime',
    instructions TEXT NOT NULL,
    prescribed_for TEXT,
    stock_count INTEGER NOT NULL DEFAULT 30,
    low_stock_threshold INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DOSE SCHEDULES
CREATE TYPE period_name AS ENUM ('Morning', 'Noon', 'Evening', 'Bedtime');

CREATE TABLE dose_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL, -- e.g. '08:00:00'
    period_name period_name NOT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=Sunday..6=Saturday
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DOSE LOGS & ADHERENCE
CREATE TYPE dose_status AS ENUM ('PENDING', 'TAKEN', 'SNOOZED', 'MISSED', 'SKIPPED');

CREATE TABLE dose_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES dose_schedules(id) ON DELETE SET NULL,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE,
    status dose_status NOT NULL DEFAULT 'PENDING',
    verified_by_caretaker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. VITALS LOGS
CREATE TABLE vitals_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    blood_sugar NUMERIC(5,2),
    temperature NUMERIC(4,1),
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 8. EMERGENCY ALERTS & ESCALATION EVENTS
CREATE TYPE alert_type AS ENUM ('MISSED_DOSE', 'EMERGENCY_SOS', 'LOW_STOCK', 'ABNORMAL_VITAL');
CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info');

CREATE TABLE facility_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'warning',
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

-- Allow caretakers to view and update residents
CREATE POLICY "Caretakers view all facility residents"
ON residents FOR ALL TO authenticated USING (true);
