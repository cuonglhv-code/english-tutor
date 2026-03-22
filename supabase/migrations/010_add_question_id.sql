-- Migration 010: Add question_id to essay_submissions
ALTER TABLE public.essay_submissions ADD COLUMN IF NOT EXISTS question_id text;
COMMENT ON COLUMN public.essay_submissions.question_id IS 'ID from the question bank (lib/questionBank.ts) or DB questions table.';
