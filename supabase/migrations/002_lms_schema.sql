-- ============================================================
-- Migration 002: LMS Schema (Goals, Exam Dates, Activity, Exercises)
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ─── 1. user_goals ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_goals (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_overall      numeric(3,1),
  target_reading      numeric(3,1),
  target_listening    numeric(3,1),
  target_writing      numeric(3,1),
  target_speaking     numeric(3,1),
  current_overall     numeric(3,1),
  current_reading     numeric(3,1),
  current_listening   numeric(3,1),
  current_writing     numeric(3,1),
  current_speaking    numeric(3,1),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_goals_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_goals_select" ON public.user_goals;
CREATE POLICY "user_goals_select" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_goals_insert" ON public.user_goals;
CREATE POLICY "user_goals_insert" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_goals_update" ON public.user_goals;
CREATE POLICY "user_goals_update" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);


-- ─── 2. user_exam_dates ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_exam_dates (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_date   date,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_exam_dates_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.user_exam_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_exam_dates_select" ON public.user_exam_dates;
CREATE POLICY "user_exam_dates_select" ON public.user_exam_dates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_exam_dates_insert" ON public.user_exam_dates;
CREATE POLICY "user_exam_dates_insert" ON public.user_exam_dates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_exam_dates_update" ON public.user_exam_dates;
CREATE POLICY "user_exam_dates_update" ON public.user_exam_dates
  FOR UPDATE USING (auth.uid() = user_id);


-- ─── 3. user_activity_log ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date   date    NOT NULL DEFAULT CURRENT_DATE,
  skill           text    NOT NULL CHECK (skill IN ('writing', 'reading', 'listening', 'speaking')),
  exercises_done  integer NOT NULL DEFAULT 1,
  minutes_spent   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_activity_unique UNIQUE (user_id, activity_date, skill)
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activity_select" ON public.user_activity_log;
CREATE POLICY "user_activity_select" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_activity_insert" ON public.user_activity_log;
CREATE POLICY "user_activity_insert" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_activity_update" ON public.user_activity_log;
CREATE POLICY "user_activity_update" ON public.user_activity_log
  FOR UPDATE USING (auth.uid() = user_id);


-- ─── 4. exercises ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.exercises (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text    NOT NULL,
  skill          text    NOT NULL CHECK (skill IN ('writing', 'reading', 'listening', 'speaking')),
  task_type      text    CHECK (task_type IN ('task1', 'task2', 'task1_builder')),
  question_type  text,
  source         text,
  description    text,
  body_text      text,
  image_url      text,
  is_published   boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercises_published_select" ON public.exercises;
CREATE POLICY "exercises_published_select" ON public.exercises
  FOR SELECT USING (is_published = true AND auth.uid() IS NOT NULL);


-- ─── 5. Seed: Exercises ──────────────────────────────────────────────────────

INSERT INTO public.exercises
  (title, skill, task_type, question_type, source, description, is_published)
VALUES
  ('UK Household Technology Adoption 1997–2001',      'writing', 'task1', 'line_graph',  'Cambridge',     'The graph shows the percentage of households with different kinds of technology in the UK from 1997 to 2001. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.', true),
  ('Producing Electricity from Coal',                 'writing', 'task1', 'process',     'Cambridge',     'The diagram below shows how one type of coal is used to produce electricity. Summarise the information by selecting and reporting the main features.', true),
  ('North American Household Composition 1970–2003',  'writing', 'task1', 'table',       'Cambridge',     'The table below shows the household composition in a North American country from 1970 and 2003. Summarise the information and make comparisons where relevant.', true),
  ('Community Centre Changes Over A Decade',          'writing', 'task1', 'map',         'Cambridge',     'The maps below show the changes to a community centre over a period of 10 years. Summarise the information by selecting and reporting the main features.', true),
  ('Living Alone Trends Across Age Groups 1850–2000', 'writing', 'task1', 'bar_chart',   'Cambridge',     'The bar chart below shows the percentage of people living alone in 5 different age groups in the US from 1850 to 2000. Summarise the information by selecting and reporting the main features.', true),
  ('Average Commute Time & Transport Modes',          'writing', 'task1', 'mixed_graph', 'IELTS Insights','The charts below show UK workers'' average time spent and methods to travel to work in 2009. Summarise the information by selecting and reporting the main features.', true),
  ('Small Theatre Plans: 2010 & 2012',                'writing', 'task1', 'map',         'Cambridge',     'The plans below show a small theatre in 2010, and the same theatre in 2012. Summarise the information by selecting and reporting the main features.', true),
  ('Population Growth in 3 Major Cities',             'writing', 'task1', 'bar_chart',   'Cambridge',     'The chart shows information about the actual and expected figures of population of three cities, Jakarta, Sao Paulo, and Shanghai. Summarise the information.', true),
  ('Technology and Society',                          'writing', 'task2', NULL,           'Cambridge',     'Some people believe that technology has made our lives more complex. To what extent do you agree or disagree?', true),
  ('Environmental Impact of International Tourism',   'writing', 'task2', NULL,           'Cambridge',     'International tourism has become a major industry worldwide. Discuss the advantages and disadvantages of this trend.', true),
  ('Education: Employer Skills vs. Knowledge',        'writing', 'task2', NULL,           'Forecast',      'Some people think that universities should provide graduates with the skills needed by employers. Others think the true function of a university is to give access to knowledge for its own sake. Discuss both views and give your own opinion.', true),
  ('Rising Crime Rates: Causes and Solutions',        'writing', 'task2', NULL,           'Actual Tests',  'In many countries the level of crime is increasing. What do you think are the main causes of crime? How can we deal with those causes?', true)
ON CONFLICT DO NOTHING;


-- ─── 6. Seed: Demo User Data ─────────────────────────────────────────────────
--
-- INSTRUCTIONS (run AFTER creating your account):
--   1. In Supabase Dashboard → Authentication → Users
--   2. Click your user → copy the UUID shown
--   3. Replace 'PASTE-YOUR-USER-UUID-HERE' below with your UUID
--   4. Run only this DO block in the SQL Editor
--
-- Example UUID format:  a1b2c3d4-e5f6-7890-abcd-ef1234567890

DO $$
DECLARE
  demo_uid  uuid := 'PASTE-YOUR-USER-UUID-HERE';
  i         integer;
  seed_date date;
BEGIN
  -- Guard: only run if the UUID exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_uid) THEN
    RAISE NOTICE 'UUID not found in auth.users. Update demo_uid and re-run.';
    RETURN;
  END IF;

  -- ── Goals ──────────────────────────────────────────────────────────────────
  INSERT INTO public.user_goals (
    user_id,
    current_overall, current_reading, current_listening, current_writing, current_speaking,
    target_overall,  target_reading,  target_listening,  target_writing,  target_speaking
  ) VALUES (
    demo_uid,
    6.0, 6.5, 6.5, 5.5, 5.5,   -- current bands (where the student is now)
    7.0, 7.0, 7.5, 7.0, 7.0    -- target bands  (what they want to achieve)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_overall   = 6.0,  current_reading   = 6.5,  current_listening = 6.5,
    current_writing   = 5.5,  current_speaking  = 5.5,
    target_overall    = 7.0,  target_reading    = 7.0,  target_listening  = 7.5,
    target_writing    = 7.0,  target_speaking   = 7.0,
    updated_at        = now();

  -- ── Exam date: 45 days from today ─────────────────────────────────────────
  INSERT INTO public.user_exam_dates (user_id, exam_date)
  VALUES (demo_uid, CURRENT_DATE + INTERVAL '45 days')
  ON CONFLICT (user_id) DO UPDATE SET
    exam_date  = CURRENT_DATE + INTERVAL '45 days',
    updated_at = now();

  -- ── Activity log: varied practice over last 56 days ───────────────────────
  FOR i IN 0..55 LOOP
    seed_date := CURRENT_DATE - i;

    -- Writing: most days (every other day, with heavier sessions early)
    IF i % 2 = 0 THEN
      INSERT INTO public.user_activity_log
        (user_id, activity_date, skill, exercises_done, minutes_spent)
      VALUES (demo_uid, seed_date, 'writing', 1 + (i % 3), 20 + (i % 5) * 10)
      ON CONFLICT (user_id, activity_date, skill) DO NOTHING;
    END IF;

    -- Reading: every 3rd day
    IF i % 3 = 0 THEN
      INSERT INTO public.user_activity_log
        (user_id, activity_date, skill, exercises_done, minutes_spent)
      VALUES (demo_uid, seed_date, 'reading', 1, 30)
      ON CONFLICT (user_id, activity_date, skill) DO NOTHING;
    END IF;

    -- Listening: every 4th day
    IF i % 4 = 0 THEN
      INSERT INTO public.user_activity_log
        (user_id, activity_date, skill, exercises_done, minutes_spent)
      VALUES (demo_uid, seed_date, 'listening', 1, 25)
      ON CONFLICT (user_id, activity_date, skill) DO NOTHING;
    END IF;

    -- Speaking: occasional (every 7th day)
    IF i % 7 = 0 THEN
      INSERT INTO public.user_activity_log
        (user_id, activity_date, skill, exercises_done, minutes_spent)
      VALUES (demo_uid, seed_date, 'speaking', 1, 15)
      ON CONFLICT (user_id, activity_date, skill) DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed data inserted for user %', demo_uid;
END $$;
