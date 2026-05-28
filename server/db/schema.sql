-- RescueAI Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Incidents reported by bystanders or victims
CREATE TABLE IF NOT EXISTS incidents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by   TEXT,
  location_lat  DECIMAL(9,6) NOT NULL,
  location_lng  DECIMAL(9,6) NOT NULL,
  location_name TEXT,
  description   TEXT NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'unknown', -- accident | fight | other
  image_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | triaged | dispatched | resolved
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AI triage results linked to an incident
CREATE TABLE IF NOT EXISTS triage_results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id       UUID REFERENCES incidents(id) ON DELETE CASCADE,
  severity_score    INTEGER CHECK (severity_score BETWEEN 1 AND 5),
  severity_label    TEXT,   -- critical | serious | moderate | minor | observation
  injury_type       TEXT,
  care_level        TEXT,   -- hospital | clinic | self-care
  first_aid_steps   JSONB,  -- array of step strings
  image_analysis    TEXT,   -- Claude's image description
  recommended_hospital_id UUID,
  ai_notes          TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital registry for South Sudan
CREATE TABLE IF NOT EXISTS hospitals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'hospital', -- hospital | clinic | health_center
  address       TEXT,
  city          TEXT,
  state         TEXT,
  lat           DECIMAL(9,6) NOT NULL,
  lng           DECIMAL(9,6) NOT NULL,
  phone         TEXT,
  capacity      INTEGER DEFAULT 0,     -- total beds
  available_beds INTEGER DEFAULT 0,
  has_emergency  BOOLEAN DEFAULT true,
  has_surgery    BOOLEAN DEFAULT false,
  has_blood_bank BOOLEAN DEFAULT false,
  operating_hours TEXT DEFAULT '24/7',
  active         BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Police report documents generated for each incident
CREATE TABLE IF NOT EXISTS police_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id   UUID REFERENCES incidents(id) ON DELETE CASCADE,
  report_number TEXT UNIQUE,          -- e.g. RES-2024-001234
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  sent_to_police BOOLEAN DEFAULT false,
  police_station TEXT,
  pdf_url        TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_triage_incident ON triage_results(incident_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_active ON hospitals(active);
