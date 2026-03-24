---
name: ielts-supabase-migration
description: >
  Use this skill when the user wants to add, modify, or remove Supabase tables,
  columns, foreign keys, RLS policies, or indexes in the jaxtina-ielts-examiner
  project. Also use when the user asks to write or review a SQL migration file.
---

# IELTS Examiner — Supabase Migration

## Goal
Produce safe, reversible, correctly named Supabase migration SQL files that
comply with the project's schema conventions and RLS security model.

## Naming Convention
Migration files must follow: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
Example: `20260324120000_add_enrollments_table.sql`

## Instructions

1. **Read existing migrations first** — scan all files in `supabase/migrations/`
   to understand the current schema before proposing any change. Never assume
   a table or column exists.

2. **Write the migration SQL** following these rules:
   - Every new table MUST have `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - Every table MUST have `created_at timestamptz DEFAULT now()` and
     `updated_at timestamptz DEFAULT now()`
   - All table names use `snake_case`
   - All foreign keys must include `ON DELETE` behaviour explicitly stated
   - No `DROP TABLE` or `DROP COLUMN` without an explicit user instruction

3. **Always include a rollback block** as a commented `-- rollback:` section
   at the bottom of every migration file.

4. **Write RLS policies** for every new table:
   - Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
   - Define at minimum: SELECT policy for authenticated users
   - Add INSERT/UPDATE/DELETE policies based on the role that owns the data

5. **Validate before presenting** — run the validation script:
   ```
   python .agent/skills/ielts-supabase-migration/scripts/validate_migration.py <file>
   ```
   Only present the migration to the user after it passes validation (exit 0).

6. **Dry-run reminder** — tell the user to run:
   ```
   supabase db diff --schema public
   supabase migration up --dry-run
   ```
   before applying to the remote project.

## Constraints
- Never apply migrations automatically — always show SQL to user first
- Never expose user data, email addresses, or secrets in migration comments
- If a change requires a multi-step migration (e.g. backfill), split into
  separate numbered files
