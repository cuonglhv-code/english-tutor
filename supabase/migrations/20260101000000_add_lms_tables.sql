-- 20260101000000_add_lms_tables.sql
--
-- NOTE:
-- This repository already includes LMS tables in earlier migrations:
-- - supabase/migrations/002_lms_schema.sql
-- - supabase/migrations/003_lms_schema.sql
--
-- To avoid breaking existing production data and code, this migration is
-- intentionally idempotent and non-destructive: it only adds safe indexes and
-- enables RLS where missing (no column renames/drops, no incompatible schema rewrites).

-- Ensure uuid generation is available
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- LMS tables (already exist in this repo) — safety hardening only
-- ---------------------------------------------------------------------------

-- user_goals
alter table if exists public.user_goals enable row level security;
create index if not exists idx_user_goals_user_id on public.user_goals (user_id);

-- user_exam_dates
alter table if exists public.user_exam_dates enable row level security;
create index if not exists idx_user_exam_dates_user_id on public.user_exam_dates (user_id);

-- user_activity_log
alter table if exists public.user_activity_log enable row level security;
create index if not exists idx_user_activity_log_user_id on public.user_activity_log (user_id);
create index if not exists idx_user_activity_log_activity_date on public.user_activity_log (activity_date);
create index if not exists idx_user_activity_log_skill on public.user_activity_log (skill);

