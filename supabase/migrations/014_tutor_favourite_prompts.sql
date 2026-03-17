-- Migration 014: Tutor favourite prompts table
-- Run this in the Supabase SQL editor or via the Supabase CLI

create table if not exists tutor_favourite_prompts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  skill      text not null,
  level      text not null,
  saved_at   timestamptz not null default now(),
  unique (user_id, text)   -- prevent duplicate prompts per user
);

-- Row Level Security: users can only read/write their own rows
alter table tutor_favourite_prompts enable row level security;

create policy "Users manage own favourites"
  on tutor_favourite_prompts
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
