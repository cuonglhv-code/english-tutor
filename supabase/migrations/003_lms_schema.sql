-- ============================================================
-- Migration 003: LMS tables — goals, exam dates, activity log
-- ============================================================

-- ─── user_goals ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_goals (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_overall   numeric(3,1),
  target_reading   numeric(3,1),
  target_listening numeric(3,1),
  target_writing   numeric(3,1),
  target_speaking  numeric(3,1),
  current_overall   numeric(3,1),
  current_reading   numeric(3,1),
  current_listening numeric(3,1),
  current_writing   numeric(3,1),
  current_speaking  numeric(3,1),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Users can view their own goals"
  ON public.user_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
CREATE POLICY "Users can insert their own goals"
  ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
CREATE POLICY "Users can update their own goals"
  ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);

-- ─── user_exam_dates ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_exam_dates (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_date  date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_exam_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own exam date" ON public.user_exam_dates;
CREATE POLICY "Users can view their own exam date"
  ON public.user_exam_dates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own exam date" ON public.user_exam_dates;
CREATE POLICY "Users can insert their own exam date"
  ON public.user_exam_dates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own exam date" ON public.user_exam_dates;
CREATE POLICY "Users can update their own exam date"
  ON public.user_exam_dates FOR UPDATE USING (auth.uid() = user_id);

-- ─── user_activity_log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date  date        NOT NULL,
  skill          text        NOT NULL CHECK (skill IN ('writing', 'reading', 'listening', 'speaking')),
  exercises_done int         NOT NULL DEFAULT 1,
  UNIQUE (user_id, activity_date, skill)
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;
CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity_log;
CREATE POLICY "Users can insert their own activity"
  ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage activity" ON public.user_activity_log;
CREATE POLICY "Service role can manage activity"
  ON public.user_activity_log FOR ALL USING (true);
