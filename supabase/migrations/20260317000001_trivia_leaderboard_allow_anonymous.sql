-- Allow anonymous leaderboard submissions (name is required; user_id optional)

alter table public.trivia_leaderboard enable row level security;

drop policy if exists "Trivia leaderboard insert" on public.trivia_leaderboard;
create policy "Trivia leaderboard insert"
  on public.trivia_leaderboard for insert
  with check (true);

