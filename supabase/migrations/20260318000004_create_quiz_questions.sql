create table if not exists quiz_questions (
  id            uuid default gen_random_uuid() primary key,
  question      text        not null,
  options       jsonb       not null,
  correct_answer int        not null,
  category      text        not null,
  difficulty    text        not null check (difficulty in ('easy','medium','hard')),
  fun_fact      text,
  source        text,
  grade_range   text        not null default 'Y6-Y11',
  active        boolean     not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_quiz_questions_filter 
  on quiz_questions (category, difficulty, active);

alter table quiz_questions enable row level security;

create policy "public read active questions"
  on quiz_questions for select
  using (active = true);

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger quiz_questions_updated_at
  before update on quiz_questions
  for each row execute procedure update_updated_at();
