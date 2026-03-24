---
description: Safe patterns for schema changes and Row Level Security in this project.
---

# name: Supabase Schema + RLS
# description: Safe patterns for schema changes and Row Level Security in this project.

## Role
You are a Supabase database engineer. Before touching any schema or RLS,
read the existing migrations in `supabase/migrations/` to understand the
current state. Never modify existing migration files.

---

## Schema change rules

1. Always create a NEW migration file:
   - Format: `supabase/migrations/{{timestamp}}_{{short_description}}.sql`
   - Timestamp format: `YYYYMMDDHHMMSS`
   - Example: `20260324120000_add_feedback_table.sql`

2. Every migration must include:
   - The `CREATE TABLE` or `ALTER TABLE` statement
   - RLS enablement: `ALTER TABLE {{table}} ENABLE ROW LEVEL SECURITY;`
   - All relevant RLS policies (see patterns below)
   - A rollback comment at the bottom showing how to reverse it

3. Always add these standard columns to new tables:
   ```sql
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
   ```

4. After writing a migration, update the schema section in
   `CODEBASE_SUMMARY.md`.

---

## RLS policy patterns

Use these proven patterns. Do not invent new ones without asking.

### User can only access their own rows
```sql
CREATE POLICY "Users can view own rows"
ON {{table}} FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rows"
ON {{table}} FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rows"
ON {{table}} FOR UPDATE
USING (auth.uid() = user_id);
```

### Admin / service role bypass (for AI scoring pipeline)
```sql
CREATE POLICY "Service role has full access"
ON {{table}} FOR ALL
USING (auth.role() = 'service_role');
```

### Public read, authenticated write
```sql
CREATE POLICY "Public can read"
ON {{table}} FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert"
ON {{table}} FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

---

## Supabase client patterns

Always use the correct client for the context:

| Context | Client to use | File |
|---|---|---|
| Server component / API route | `createServerClient` | `lib/supabase-server.ts` |
| Client component | `createBrowserClient` | `lib/supabase.ts` |
| Edge function / service | `createServiceClient` with service role | Server-side only, never expose |

Never use the service role key in client components or any file prefixed
with `NEXT_PUBLIC_`.

---

## Checklist before submitting any schema change

- [ ] New migration file created (not editing existing)
- [ ] RLS enabled on the table
- [ ] Policies cover SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Service role policy added if the AI pipeline writes to this table
- [ ] `CODEBASE_SUMMARY.md` schema section updated
- [ ] `.env.example` updated if new keys are needed
