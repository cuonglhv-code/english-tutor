-- Migration to add topics column to quiz_leaderboard
ALTER TABLE public.quiz_leaderboard 
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}'::TEXT[];
