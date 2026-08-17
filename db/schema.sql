-- Chosen Gen Hub — database schema
-- Run this once in Supabase's SQL Editor (or via `npm run db:init`)

CREATE TABLE IF NOT EXISTS members (
  id                  TEXT PRIMARY KEY,
  full_name           TEXT NOT NULL,
  phone               TEXT NOT NULL UNIQUE,
  email               TEXT DEFAULT '',
  dob                 TEXT DEFAULT '',
  gender              TEXT DEFAULT '',
  address             TEXT DEFAULT '',
  emergency_contact   TEXT DEFAULT '',
  notes               TEXT DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'pending',   -- pending | active | inactive
  role                TEXT NOT NULL DEFAULT 'member',    -- member | secretary | treasurer
  registered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contributions (
  id            TEXT PRIMARY KEY,
  member        TEXT NOT NULL,
  type          TEXT NOT NULL,        -- Tithe | Offering | Welfare | Building | Other
  amount        NUMERIC NOT NULL,
  date          DATE NOT NULL,
  notes         TEXT DEFAULT '',
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id      TEXT PRIMARY KEY,
  title   TEXT NOT NULL,
  body    TEXT NOT NULL,
  date    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  desc_text    TEXT DEFAULT '',
  date         TIMESTAMPTZ NOT NULL,
  time_label   TEXT DEFAULT '',
  rsvp_count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS prayers (
  id      TEXT PRIMARY KEY,
  type    TEXT NOT NULL DEFAULT 'prayer',   -- prayer | praise
  author  TEXT NOT NULL DEFAULT 'Anonymous',
  body    TEXT NOT NULL,
  date    TIMESTAMPTZ NOT NULL DEFAULT now(),
  amens   INTEGER NOT NULL DEFAULT 0
);

-- One row per (event, device) RSVP, and one per (prayer, device) amen.
-- device_id is a random ID generated client-side and stored in localStorage,
-- just to stop the same visitor double-clicking. It's not a login.
CREATE TABLE IF NOT EXISTS rsvps (
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  device_id  TEXT NOT NULL,
  PRIMARY KEY (event_id, device_id)
);

CREATE TABLE IF NOT EXISTS amens (
  prayer_id  TEXT NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
  device_id  TEXT NOT NULL,
  PRIMARY KEY (prayer_id, device_id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id         BIGSERIAL PRIMARY KEY,
  msg        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_prayers_date ON prayers(date);
