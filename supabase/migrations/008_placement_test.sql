-- ============================================================
-- Migration 008: Placement Test schema
-- ============================================================

-- ─── Ensure is_admin() helper exists (idempotent, safe to re-run) ─────────────
-- Defined here so this migration is self-contained and does not depend on
-- migration 004 having been applied first.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$;

-- ─── placement_tests ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_tests (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                      TEXT        NOT NULL DEFAULT 'in_progress'
                                          CHECK (status IN ('in_progress', 'completed')),
  started_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at                TIMESTAMPTZ,
  reading_raw_score           INT,
  listening_raw_score         INT,
  reading_band                NUMERIC(3,1),
  listening_band              NUMERIC(3,1),
  writing_band                NUMERIC(3,1),
  estimated_entry_band_range  TEXT,
  remaining_seconds_reading   INT         NOT NULL DEFAULT 3600,
  remaining_seconds_listening INT         NOT NULL DEFAULT 2100,
  remaining_seconds_writing   INT         NOT NULL DEFAULT 3600,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own placement tests" ON public.placement_tests;
CREATE POLICY "Users can view own placement tests"
  ON public.placement_tests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own placement tests" ON public.placement_tests;
CREATE POLICY "Users can insert own placement tests"
  ON public.placement_tests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own placement tests" ON public.placement_tests;
CREATE POLICY "Users can update own placement tests"
  ON public.placement_tests FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all placement tests" ON public.placement_tests;
CREATE POLICY "Admins can view all placement tests"
  ON public.placement_tests FOR ALL USING (public.is_admin());

-- ─── placement_reading_questions ──────────────────────────────────────────────
-- Flat structure: passage data repeated per question so a single query
-- fetches both passage and question rows together.
CREATE TABLE IF NOT EXISTS public.placement_reading_questions (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_title    TEXT  NOT NULL,
  passage_text     TEXT  NOT NULL,   -- Full passage (markdown supported)
  part_number      INT   NOT NULL DEFAULT 1,
  question_number  INT   NOT NULL,
  question_text    TEXT  NOT NULL,
  question_type    TEXT  NOT NULL
                   CHECK (question_type IN ('true_false_ng', 'multiple_choice', 'fill_blank', 'matching')),
  options          JSONB,             -- ["A: option text", "B: option text", …]
  correct_answer   TEXT  NOT NULL,   -- "TRUE", "FALSE", "NOT GIVEN", "A", free-text
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  display_order    INT   NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_reading_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active reading questions" ON public.placement_reading_questions;
CREATE POLICY "Anyone can read active reading questions"
  ON public.placement_reading_questions FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage reading questions" ON public.placement_reading_questions;
CREATE POLICY "Admins manage reading questions"
  ON public.placement_reading_questions FOR ALL USING (public.is_admin());

-- ─── placement_listening_audio ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_listening_audio (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT  NOT NULL,
  storage_path     TEXT  NOT NULL,   -- Path inside Supabase Storage bucket "placement-audio"
  public_url       TEXT  NOT NULL,   -- Public or signed URL
  duration_seconds INT,
  part_number      INT   NOT NULL DEFAULT 1,
  transcript       TEXT,             -- Optional transcript for admin reference
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_listening_audio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active listening audio" ON public.placement_listening_audio;
CREATE POLICY "Anyone can read active listening audio"
  ON public.placement_listening_audio FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage listening audio" ON public.placement_listening_audio;
CREATE POLICY "Admins manage listening audio"
  ON public.placement_listening_audio FOR ALL USING (public.is_admin());

-- ─── placement_listening_questions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_listening_questions (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id         UUID  REFERENCES public.placement_listening_audio(id) ON DELETE CASCADE,
  question_number  INT   NOT NULL,
  question_text    TEXT  NOT NULL,
  question_type    TEXT  NOT NULL
                   CHECK (question_type IN ('fill_blank', 'multiple_choice', 'matching')),
  options          JSONB,             -- For multiple_choice
  correct_answer   TEXT  NOT NULL,
  context_text     TEXT,             -- Situational context printed above answer boxes
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  display_order    INT   NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_listening_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active listening questions" ON public.placement_listening_questions;
CREATE POLICY "Anyone can read active listening questions"
  ON public.placement_listening_questions FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage listening questions" ON public.placement_listening_questions;
CREATE POLICY "Admins manage listening questions"
  ON public.placement_listening_questions FOR ALL USING (public.is_admin());

-- ─── placement_writing_tasks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_writing_tasks (
  id                   UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type            TEXT  NOT NULL DEFAULT 'task1'
                             CHECK (task_type IN ('task1', 'task2')),
  prompt_text          TEXT  NOT NULL,
  image_url            TEXT,
  visual_description   TEXT,
  min_words            INT   NOT NULL DEFAULT 150,
  recommended_minutes  INT   NOT NULL DEFAULT 20,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_writing_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active writing tasks" ON public.placement_writing_tasks;
CREATE POLICY "Anyone can read active writing tasks"
  ON public.placement_writing_tasks FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage writing tasks" ON public.placement_writing_tasks;
CREATE POLICY "Admins manage writing tasks"
  ON public.placement_writing_tasks FOR ALL USING (public.is_admin());

-- ─── placement_answers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_answers (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id         UUID  NOT NULL REFERENCES public.placement_tests(id) ON DELETE CASCADE,
  section         TEXT  NOT NULL CHECK (section IN ('reading', 'listening', 'writing')),
  question_number INT,
  answer_text     TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_id, section, question_number)
);

ALTER TABLE public.placement_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own placement answers" ON public.placement_answers;
CREATE POLICY "Users can manage own placement answers"
  ON public.placement_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.placement_tests pt
      WHERE pt.id = placement_answers.test_id AND pt.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all placement answers" ON public.placement_answers;
CREATE POLICY "Admins can view all placement answers"
  ON public.placement_answers FOR ALL USING (public.is_admin());

-- ─── placement_writing_evaluations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_writing_evaluations (
  id                              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id                         UUID  NOT NULL REFERENCES public.placement_tests(id) ON DELETE CASCADE,
  essay_text                      TEXT  NOT NULL,
  word_count                      INT,
  task_achievement_band           NUMERIC(3,1),
  coherence_cohesion_band         NUMERIC(3,1),
  lexical_resource_band           NUMERIC(3,1),
  grammatical_range_accuracy_band NUMERIC(3,1),
  overall_band                    NUMERIC(3,1),
  feedback_json                   JSONB,  -- Same shape as feedback_results.feedback_json
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.placement_writing_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own writing evaluations" ON public.placement_writing_evaluations;
CREATE POLICY "Users can view own writing evaluations"
  ON public.placement_writing_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.placement_tests pt
      WHERE pt.id = placement_writing_evaluations.test_id AND pt.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all writing evaluations" ON public.placement_writing_evaluations;
CREATE POLICY "Admins can view all writing evaluations"
  ON public.placement_writing_evaluations FOR ALL USING (public.is_admin());

-- ─── user_study_plans ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_study_plans (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id          UUID  REFERENCES public.placement_tests(id) ON DELETE SET NULL,
  entry_band_range TEXT  NOT NULL,
  goal_band        TEXT  NOT NULL,
  plan_name        TEXT  NOT NULL,
  stages_json      JSONB NOT NULL,
  total_months     INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own study plans" ON public.user_study_plans;
CREATE POLICY "Users can manage own study plans"
  ON public.user_study_plans FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all study plans" ON public.user_study_plans;
CREATE POLICY "Admins can view all study plans"
  ON public.user_study_plans FOR ALL USING (public.is_admin());

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_placement_tests_user_id ON public.placement_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_placement_answers_test_id ON public.placement_answers(test_id);
CREATE INDEX IF NOT EXISTS idx_placement_writing_evals_test_id ON public.placement_writing_evaluations(test_id);
CREATE INDEX IF NOT EXISTS idx_user_study_plans_user_id ON public.user_study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_questions_active ON public.placement_reading_questions(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_listening_questions_audio ON public.placement_listening_questions(audio_id, display_order);

-- ─── Seed: sample reading passage (Part 1) ────────────────────────────────────
-- Remove this block after seeding with real content.
INSERT INTO public.placement_reading_questions
  (passage_title, passage_text, part_number, question_number, question_text, question_type, options, correct_answer, display_order)
VALUES
  (
    'The History of Public Libraries',
    E'Public libraries have a long and distinguished history. The earliest known library was founded in ancient Assyria around 650 BCE by King Ashurbanipal, who collected clay tablets inscribed with cuneiform text. However, the modern concept of a public library — one freely accessible to all citizens — emerged in the 19th century.\n\nIn 1850, the British Parliament passed the Public Libraries Act, which allowed local councils to levy a rate to fund free public libraries. This was a landmark moment: for the first time, government acknowledged the public\'s right to free access to knowledge. Similar legislation followed in the United States, where philanthropist Andrew Carnegie funded the construction of over 2,500 libraries between 1883 and 1929.\n\nToday, public libraries continue to evolve. Digital collections, coding workshops, and community spaces have supplemented the traditional shelves of books. Despite predictions of their decline in the internet age, library visitor numbers in many countries have remained stable or even increased, suggesting that the public library fulfils social and educational needs that technology alone cannot satisfy.',
    1,
    1,
    'The earliest known library was founded in ancient Assyria by King Ashurbanipal.',
    'true_false_ng',
    NULL,
    'TRUE',
    1
  ),
  (
    'The History of Public Libraries',
    E'Public libraries have a long and distinguished history. The earliest known library was founded in ancient Assyria around 650 BCE by King Ashurbanipal, who collected clay tablets inscribed with cuneiform text. However, the modern concept of a public library — one freely accessible to all citizens — emerged in the 19th century.\n\nIn 1850, the British Parliament passed the Public Libraries Act, which allowed local councils to levy a rate to fund free public libraries. This was a landmark moment: for the first time, government acknowledged the public\'s right to free access to knowledge. Similar legislation followed in the United States, where philanthropist Andrew Carnegie funded the construction of over 2,500 libraries between 1883 and 1929.\n\nToday, public libraries continue to evolve. Digital collections, coding workshops, and community spaces have supplemented the traditional shelves of books. Despite predictions of their decline in the internet age, library visitor numbers in many countries have remained stable or even increased, suggesting that the public library fulfils social and educational needs that technology alone cannot satisfy.',
    1,
    2,
    'The Public Libraries Act was passed by the British Parliament in 1840.',
    'true_false_ng',
    NULL,
    'FALSE',
    2
  ),
  (
    'The History of Public Libraries',
    E'Public libraries have a long and distinguished history. The earliest known library was founded in ancient Assyria around 650 BCE by King Ashurbanipal, who collected clay tablets inscribed with cuneiform text. However, the modern concept of a public library — one freely accessible to all citizens — emerged in the 19th century.\n\nIn 1850, the British Parliament passed the Public Libraries Act, which allowed local councils to levy a rate to fund free public libraries. This was a landmark moment: for the first time, government acknowledged the public\'s right to free access to knowledge. Similar legislation followed in the United States, where philanthropist Andrew Carnegie funded the construction of over 2,500 libraries between 1883 and 1929.\n\nToday, public libraries continue to evolve. Digital collections, coding workshops, and community spaces have supplemented the traditional shelves of books. Despite predictions of their decline in the internet age, library visitor numbers in many countries have remained stable or even increased, suggesting that the public library fulfils social and educational needs that technology alone cannot satisfy.',
    1,
    3,
    'Andrew Carnegie personally selected the books stocked in the libraries he funded.',
    'true_false_ng',
    NULL,
    'NOT GIVEN',
    3
  ),
  (
    'The History of Public Libraries',
    E'Public libraries have a long and distinguished history. The earliest known library was founded in ancient Assyria around 650 BCE by King Ashurbanipal, who collected clay tablets inscribed with cuneiform text. However, the modern concept of a public library — one freely accessible to all citizens — emerged in the 19th century.\n\nIn 1850, the British Parliament passed the Public Libraries Act, which allowed local councils to levy a rate to fund free public libraries. This was a landmark moment: for the first time, government acknowledged the public\'s right to free access to knowledge. Similar legislation followed in the United States, where philanthropist Andrew Carnegie funded the construction of over 2,500 libraries between 1883 and 1929.\n\nToday, public libraries continue to evolve. Digital collections, coding workshops, and community spaces have supplemented the traditional shelves of books. Despite predictions of their decline in the internet age, library visitor numbers in many countries have remained stable or even increased, suggesting that the public library fulfils social and educational needs that technology alone cannot satisfy.',
    1,
    4,
    'What was the primary purpose of the 1850 Public Libraries Act?',
    'multiple_choice',
    '["A: To tax all citizens equally", "B: To fund free public libraries", "C: To regulate book publishing", "D: To build schools across Britain"]',
    'B',
    4
  ),
  (
    'The History of Public Libraries',
    E'Public libraries have a long and distinguished history. The earliest known library was founded in ancient Assyria around 650 BCE by King Ashurbanipal, who collected clay tablets inscribed with cuneiform text. However, the modern concept of a public library — one freely accessible to all citizens — emerged in the 19th century.\n\nIn 1850, the British Parliament passed the Public Libraries Act, which allowed local councils to levy a rate to fund free public libraries. This was a landmark moment: for the first time, government acknowledged the public\'s right to free access to knowledge. Similar legislation followed in the United States, where philanthropist Andrew Carnegie funded the construction of over 2,500 libraries between 1883 and 1929.\n\nToday, public libraries continue to evolve. Digital collections, coding workshops, and community spaces have supplemented the traditional shelves of books. Despite predictions of their decline in the internet age, library visitor numbers in many countries have remained stable or even increased, suggesting that the public library fulfils social and educational needs that technology alone cannot satisfy.',
    1,
    5,
    'Philanthropist _______ funded the construction of over 2,500 libraries in the United States.',
    'fill_blank',
    NULL,
    'Carnegie',
    5
  )
ON CONFLICT DO NOTHING;

-- ─── Seed: sample writing task ────────────────────────────────────────────────
INSERT INTO public.placement_writing_tasks
  (task_type, prompt_text, visual_description, min_words, recommended_minutes)
VALUES
  (
    'task1',
    'The bar chart below shows the percentage of households in the UK that owned various electronic devices in 2009 and 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    'A bar chart comparing ownership rates (%) of five electronic devices — smartphones, laptops, tablets, smart TVs, and desktop computers — in UK households in 2009 vs 2019. Smartphones grew from 22% to 85%. Laptops grew from 47% to 73%. Tablets rose from 2% to 59%. Smart TVs increased from 5% to 40%. Desktops declined from 70% to 45%.',
    150,
    20
  )
ON CONFLICT DO NOTHING;
