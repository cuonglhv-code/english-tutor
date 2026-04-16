-- ─── Migration 009: Notes-completion support for Listening Part 4 ─────────────
-- Adds:
--   • notes_layout_json (JSONB) to placement_listening_audio
--   • before_text / after_text (TEXT) to placement_listening_questions
--   • 'notes_completion' to the question_type CHECK constraint

-- 1. Add notes_layout_json to audio table
ALTER TABLE public.placement_listening_audio
  ADD COLUMN IF NOT EXISTS notes_layout_json JSONB;

COMMENT ON COLUMN public.placement_listening_audio.notes_layout_json IS
  'JSON layout for notes-completion parts. Structure: { title: string, items: NotesItem[] }
   where NotesItem = heading | plain | gap. See NotesCard.tsx for the TypeScript types.';

-- 2. Add before_text / after_text to questions table
ALTER TABLE public.placement_listening_questions
  ADD COLUMN IF NOT EXISTS before_text TEXT,
  ADD COLUMN IF NOT EXISTS after_text  TEXT;

COMMENT ON COLUMN public.placement_listening_questions.before_text IS
  'For notes_completion: text that appears BEFORE the inline blank in the notes card.';
COMMENT ON COLUMN public.placement_listening_questions.after_text IS
  'For notes_completion: text that appears AFTER the inline blank in the notes card.';

-- 3. Update the question_type CHECK constraint to allow 'notes_completion'
-- Drop the old constraint and recreate with the new value.
ALTER TABLE public.placement_listening_questions
  DROP CONSTRAINT IF EXISTS placement_listening_questions_question_type_check;

ALTER TABLE public.placement_listening_questions
  ADD CONSTRAINT placement_listening_questions_question_type_check
    CHECK (question_type IN ('fill_blank', 'multiple_choice', 'matching', 'notes_completion'));
