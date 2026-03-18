-- Add test_history column to store per-question breakdown for each play

alter table public.trivia_leaderboard
  add column if not exists test_history jsonb default '[]'::jsonb;

comment on column public.trivia_leaderboard.test_history is
  'JSON array of {question, options, correctAnswer, chosen, correct} objects';
