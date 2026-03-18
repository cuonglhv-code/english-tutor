-- Allow anonymous leaderboard submissions (name is required; user_id optional)

alter table public.quiz_leaderboard enable row level security;

drop policy if exists "Quiz leaderboard insert" on public.quiz_leaderboard;
create policy "Quiz leaderboard insert"
  on public.quiz_leaderboard for insert
  with check (true);

