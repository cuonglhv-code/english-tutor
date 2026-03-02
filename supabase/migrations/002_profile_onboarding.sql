-- ============================================================
-- Migration 002: Onboarding profile fields + essay plan columns
-- ============================================================

-- ─── profiles: add onboarding fields ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age                  int,
  ADD COLUMN IF NOT EXISTS city                 text,
  ADD COLUMN IF NOT EXISTS phone                text,
  ADD COLUMN IF NOT EXISTS current_writing_band text,
  ADD COLUMN IF NOT EXISTS target_writing_band  text,
  ADD COLUMN IF NOT EXISTS profile_completed    boolean NOT NULL DEFAULT false;

-- ─── essay_submissions: add essay plan columns ───────────────────────────────
ALTER TABLE public.essay_submissions
  ADD COLUMN IF NOT EXISTS essay_plan_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS essay_plan_text      text;
