-- ─── Migration 010: Add task_type to placement_writing_evaluations ──────────
-- Allows both Task 1 and Task 2 evaluations to be stored per test.
-- Existing rows (which were all Task 2 evaluations) default to 'task2'.

ALTER TABLE public.placement_writing_evaluations
  ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'task2'
    CHECK (task_type IN ('task1', 'task2'));

COMMENT ON COLUMN public.placement_writing_evaluations.task_type IS
  '''task1'' = Writing Task 1 (chart/graph description), ''task2'' = Writing Task 2 (essay)';
