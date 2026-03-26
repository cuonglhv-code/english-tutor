-- Rename trivia tables to quiz
ALTER TABLE IF EXISTS trivia_leaderboard RENAME TO quiz_leaderboard;
ALTER TABLE IF EXISTS trivia_questions RENAME TO quiz_questions;
