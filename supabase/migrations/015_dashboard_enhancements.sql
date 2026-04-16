-- ────────────────────────────────────────────────────────────────────────────
-- 015_dashboard_enhancements.sql
-- Adds time-tracking columns, a performance index, and the engagement_events
-- table for wizard instrumentation and engagement stats on the dashboard.
-- Run via: Supabase Dashboard → SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

-- Track time the user spent writing (milliseconds, wizard mount → submission)
ALTER TABLE essay_submissions ADD COLUMN IF NOT EXISTS time_spent_ms INTEGER;

-- Track which step the user abandoned on (NULL = completed normally)
ALTER TABLE essay_submissions ADD COLUMN IF NOT EXISTS abandoned_at_step INTEGER;

-- Index for dashboard queries (user's submissions sorted by date)
CREATE INDEX IF NOT EXISTS idx_essay_submissions_user_created
  ON essay_submissions(user_id, submitted_at DESC);

-- ─── Engagement Events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagement_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name  TEXT        NOT NULL,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- Users can only read their own events
CREATE POLICY "Users see own events"
  ON engagement_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own events
CREATE POLICY "Users insert own events"
  ON engagement_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for per-user queries
CREATE INDEX IF NOT EXISTS idx_engagement_events_user_created
  ON engagement_events(user_id, created_at DESC);
