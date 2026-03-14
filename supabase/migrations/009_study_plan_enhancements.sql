-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009 — Study Plan Enhancements
-- Adds band scores, overall average, and consultant fields to user_study_plans.
-- Run this in Supabase SQL Editor after migration 008.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_study_plans
  ADD COLUMN IF NOT EXISTS reading_band     NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS listening_band   NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS writing_band     NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS overall_average  NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS writing_feedback_json JSONB,      -- key writing highlights
  ADD COLUMN IF NOT EXISTS consultant_notes TEXT,            -- for the education consultant
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'archived'));

-- Index for admin / consultant dashboard queries
CREATE INDEX IF NOT EXISTS idx_user_study_plans_status
  ON public.user_study_plans (status);

CREATE INDEX IF NOT EXISTS idx_user_study_plans_created_at
  ON public.user_study_plans (created_at DESC);
