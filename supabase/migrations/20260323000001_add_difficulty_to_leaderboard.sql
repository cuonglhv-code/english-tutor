-- Migration to add difficulty column to quiz_leaderboard
ALTER TABLE public.quiz_leaderboard 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
