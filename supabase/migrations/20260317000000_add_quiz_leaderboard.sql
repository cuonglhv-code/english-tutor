-- Quiz leaderboard storage (Supabase Postgres)

create table if not exists public.quiz_leaderboard (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        references auth.users(id) on delete set null,
  name           text        not null,
  score          int         not null check (score >= 0),
  total          int         not null check (total > 0),
  time_seconds   int         not null check (time_seconds >= 0),
  question_count int         not null check (question_count > 0),
  played_at      timestamptz not null default now()
);

create index if not exists idx_quiz_leaderboard_played_at on public.quiz_leaderboard (played_at desc);
create index if not exists idx_quiz_leaderboard_qcount on public.quiz_leaderboard (question_count);
create index if not exists idx_quiz_leaderboard_score_time on public.quiz_leaderboard (question_count, score desc, time_seconds asc, played_at desc);

alter table public.quiz_leaderboard enable row level security;

-- Anyone (even anon) can read the leaderboard. Writes are allowed for authenticated users.
drop policy if exists "Quiz leaderboard read" on public.quiz_leaderboard;
create policy "Quiz leaderboard read"
  on public.quiz_leaderboard for select
  using (true);

drop policy if exists "Quiz leaderboard insert" on public.quiz_leaderboard;
create policy "Quiz leaderboard insert"
  on public.quiz_leaderboard for insert
  with check (auth.uid() is not null);

