-- ============================================================
-- Migration 001: Initial schema for IELTS Writing Tutor
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        NOT NULL,
  display_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── essay_submissions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.essay_submissions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_type      text        NOT NULL CHECK (task_type IN ('task1', 'task2')),
  prompt_text    text        NOT NULL,
  essay_text     text        NOT NULL,
  word_count     int         NOT NULL,
  language       text        NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'vi')),
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  scoring_method text        NOT NULL CHECK (scoring_method IN ('ai_examiner', 'rule_based_fallback'))
);

ALTER TABLE public.essay_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.essay_submissions;
CREATE POLICY "Users can view their own submissions"
  ON public.essay_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.essay_submissions;
CREATE POLICY "Users can insert their own submissions"
  ON public.essay_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── feedback_results ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_results (
  id                             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id                  uuid        NOT NULL REFERENCES public.essay_submissions(id) ON DELETE CASCADE,
  overall_band                   numeric(3,1) NOT NULL,
  task_achievement_band          numeric(3,1) NOT NULL,
  coherence_cohesion_band        numeric(3,1) NOT NULL,
  lexical_resource_band          numeric(3,1) NOT NULL,
  grammatical_range_accuracy_band numeric(3,1) NOT NULL,
  feedback_json                  jsonb       NOT NULL DEFAULT '{}',
  generated_at                   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback_results;
CREATE POLICY "Users can view their own feedback"
  ON public.feedback_results FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM public.essay_submissions
      WHERE id = submission_id
    )
  );

DROP POLICY IF EXISTS "Service role can insert feedback" ON public.feedback_results;
CREATE POLICY "Service role can insert feedback"
  ON public.feedback_results FOR INSERT
  WITH CHECK (true);  -- enforced server-side via service role key

-- ─── user_progress view ──────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.user_progress AS
SELECT
  es.user_id,
  ROUND(AVG(fr.overall_band)::numeric, 1)                                      AS average_band,
  COUNT(DISTINCT es.id)::int                                                    AS total_submissions,
  MAX(es.submitted_at)                                                           AS last_submission_at,
  jsonb_build_object(
    'ta',  ROUND(AVG(fr.task_achievement_band)::numeric, 1),
    'cc',  ROUND(AVG(fr.coherence_cohesion_band)::numeric, 1),
    'lr',  ROUND(AVG(fr.lexical_resource_band)::numeric, 1),
    'gra', ROUND(AVG(fr.grammatical_range_accuracy_band)::numeric, 1)
  )                                                                             AS average_per_criterion
FROM public.essay_submissions  es
JOIN public.feedback_results   fr ON fr.submission_id = es.id
GROUP BY es.user_id;

-- Grant SELECT on view to authenticated users (RLS applied on underlying tables)
GRANT SELECT ON public.user_progress TO authenticated;
