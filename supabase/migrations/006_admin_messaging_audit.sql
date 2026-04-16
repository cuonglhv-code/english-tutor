-- ============================================================
-- Migration 006: Admin infrastructure — fully self-contained
--
-- This migration is safe to run on a clean database that only
-- has migration 001 (initial schema) applied. It creates or
-- idempotently adds everything needed.
--
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- 0. PREREQUISITES
-- ═══════════════════════════════════════════════════════════

-- ─── 0a. Ensure profiles has all expected columns ────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role          TEXT        NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS full_name     TEXT,
  ADD COLUMN IF NOT EXISTS display_name  TEXT,
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS current_band  NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS target_band   NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS enrolled_at   TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN     DEFAULT true,
  ADD COLUMN IF NOT EXISTS notes         TEXT;


-- ─── 0b. is_admin() helper function ─────────────────────────────────────────
--         Used by every RLS policy below. Safe to CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


-- ─── 0c. Ensure exercises table exists (question bank) ───────────────────────

CREATE TABLE IF NOT EXISTS public.exercises (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  skill          TEXT        NOT NULL DEFAULT 'writing'
                             CHECK (skill IN ('writing', 'reading', 'listening', 'speaking')),
  task_type      TEXT        CHECK (task_type IN ('task1', 'task2', 'task1_builder')),
  question_type  TEXT,
  source         TEXT,
  description    TEXT,
  body_text      TEXT,
  image_url      TEXT,
  -- Task 1 visual fields (added here; idempotent via ADD COLUMN IF NOT EXISTS below)
  task_number    INT,
  visual_description      TEXT,
  visual_description_json JSONB,
  is_published   BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add visual fields if the table existed before this migration
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS task_number            INT,
  ADD COLUMN IF NOT EXISTS visual_description     TEXT,
  ADD COLUMN IF NOT EXISTS visual_description_json JSONB;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Public read of published exercises for authenticated users
DROP POLICY IF EXISTS "exercises_published_select" ON public.exercises;
CREATE POLICY "exercises_published_select"
  ON public.exercises FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- 1. messages TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.messages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = broadcast
  subject        TEXT        NOT NULL,
  body           TEXT        NOT NULL,
  message_type   TEXT        NOT NULL DEFAULT 'in_app'
                             CHECK (message_type IN ('in_app', 'email')),
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read        BOOLEAN     NOT NULL DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages addressed to them or broadcasts
DROP POLICY IF EXISTS "Users read own messages" ON public.messages;
CREATE POLICY "Users read own messages"
  ON public.messages FOR SELECT
  USING (
    recipient_id = auth.uid()
    OR recipient_id IS NULL
    OR sender_id = auth.uid()
  );

-- Users can mark their own received messages as read
DROP POLICY IF EXISTS "Users update own messages" ON public.messages;
CREATE POLICY "Users update own messages"
  ON public.messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Admins have full access
DROP POLICY IF EXISTS "Admin full access messages" ON public.messages;
CREATE POLICY "Admin full access messages"
  ON public.messages FOR ALL
  USING (public.is_admin());


-- ═══════════════════════════════════════════════════════════
-- 2. audit_log TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_log (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action         TEXT        NOT NULL,
  target_table   TEXT,
  target_id      TEXT,
  detail         JSONB,
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access audit_log" ON public.audit_log;
CREATE POLICY "Admin full access audit_log"
  ON public.audit_log FOR ALL
  USING (public.is_admin());


-- ═══════════════════════════════════════════════════════════
-- 3. RLS POLICIES ON EXISTING TABLES
-- ═══════════════════════════════════════════════════════════

-- profiles: admin can read/write all rows
DROP POLICY IF EXISTS "Admin full access profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles"  ON public.profiles;
CREATE POLICY "Admin full access profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- exercises: admin CRUD
DROP POLICY IF EXISTS "Admin full access exercises" ON public.exercises;
CREATE POLICY "Admin full access exercises"
  ON public.exercises FOR ALL
  USING (public.is_admin());

-- essay_submissions: admin read all
DROP POLICY IF EXISTS "Admin read all submissions"          ON public.essay_submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions"   ON public.essay_submissions;
CREATE POLICY "Admin read all submissions"
  ON public.essay_submissions FOR SELECT
  USING (public.is_admin());

-- feedback_results: admin read all
DROP POLICY IF EXISTS "Admin read all feedback_results"     ON public.feedback_results;
DROP POLICY IF EXISTS "Admins can manage all feedback"      ON public.feedback_results;
CREATE POLICY "Admin read all feedback_results"
  ON public.feedback_results FOR SELECT
  USING (public.is_admin());


-- ═══════════════════════════════════════════════════════════
-- 4. ANALYTICS VIEWS
-- ═══════════════════════════════════════════════════════════

-- ─── 4a. Aggregate student stats ────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_student_stats AS
SELECT
  COUNT(*)    FILTER (WHERE role IN ('student', 'user'))               AS total_students,
  COUNT(*)    FILTER (WHERE role IN ('student', 'user') AND is_active) AS active_students,
  COUNT(*)    FILTER (WHERE role = 'teacher')                          AS total_teachers,
  ROUND(AVG(current_band) FILTER (WHERE role IN ('student', 'user')), 1)
                                                                        AS avg_current_band,
  ROUND(AVG(target_band)  FILTER (WHERE role IN ('student', 'user')), 1)
                                                                        AS avg_target_band
FROM public.profiles;

GRANT SELECT ON public.admin_student_stats TO authenticated;


-- ─── 4b. Daily submission stats ─────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_submission_stats AS
SELECT
  DATE_TRUNC('day', es.submitted_at)                     AS period,
  COUNT(*)                                                AS total,
  ROUND(AVG(fr.overall_band)::numeric, 1)                AS avg_band,
  COUNT(*) FILTER (WHERE es.task_type = 'task1')         AS task1_count,
  COUNT(*) FILTER (WHERE es.task_type = 'task2')         AS task2_count
FROM public.essay_submissions  es
LEFT JOIN public.feedback_results fr ON fr.submission_id = es.id
GROUP BY DATE_TRUNC('day', es.submitted_at)
ORDER BY period DESC;

GRANT SELECT ON public.admin_submission_stats TO authenticated;


-- ─── 4c. Per-user writing progress ──────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_user_progress AS
SELECT
  p.id                                                    AS user_id,
  p.email,
  COALESCE(p.full_name, p.display_name, p.email)         AS full_name,
  p.role,
  p.current_band,
  p.target_band,
  p.is_active,
  p.enrolled_at,
  COUNT(DISTINCT es.id)                                   AS total_submissions,
  ROUND(AVG(fr.overall_band)::numeric, 1)                AS avg_overall_band,
  MAX(es.submitted_at)                                    AS last_submission_at
FROM public.profiles p
LEFT JOIN public.essay_submissions  es ON es.user_id = p.id
LEFT JOIN public.feedback_results   fr ON fr.submission_id = es.id
WHERE p.role IN ('student', 'user')
GROUP BY p.id, p.email, p.full_name, p.display_name,
         p.role, p.current_band, p.target_band,
         p.is_active, p.enrolled_at;

GRANT SELECT ON public.admin_user_progress TO authenticated;
