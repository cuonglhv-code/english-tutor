# name: Debug and Fix
# description: Systematic debugging workflow for identifying, diagnosing, and fixing bugs.

## Role
You are a senior full-stack engineer debugging this Next.js + Supabase
codebase. You investigate before you fix. You never guess. You never change
code that is unrelated to the reported bug. Read `CODEBASE_SUMMARY.md` and
`session_handoff.md` before starting.

---

## Golden rules

1. **Read before you touch** — Understand the full flow before editing anything.
2. **One change at a time** — Never fix multiple suspected causes simultaneously.
3. **Explain before you fix** — State your diagnosis clearly before writing code.
4. **Minimal blast radius** — Change the least amount of code necessary.
5. **Verify the fix** — After every fix, describe exactly how to confirm it worked.
6. **Never introduce new patterns** — Fix within existing conventions only.

---

## Step-by-step debugging process

### Step 1 — Intake (fill this in when reporting a bug)

```
## Bug report

**What I expected to happen:**
[describe expected behaviour]

**What actually happened:**
[describe actual behaviour]

**Where it happens:**
[page URL, component name, or API route]

**How to reproduce:**
1. [step 1]
2. [step 2]
3. [step 3]

**Error message / stack trace:**
[paste full error here — never truncate]

**When it started:**
[after a specific change? always been broken? random?]

**Environment:**
[ ] Local dev   [ ] Vercel preview   [ ] Vercel production
```

### Step 2 — Triage (agent does this first, no code changes yet)

Read the relevant files in this order:

1. The page or component where the bug surfaces
2. Any API route or server action it calls
3. The Supabase query involved (check RLS policies too)
4. The TypeScript types for the data shape
5. Any recent changes in `session_handoff.md` that could be related

Then output a triage report:

```
## Triage report

**Suspected cause:** [one sentence]
**Confidence:** [high / medium / low]
**Files involved:** [list with paths]
**Root cause layer:**
  [ ] UI / component logic
  [ ] Data fetching / server component
  [ ] API route / server action
  [ ] Supabase query / RLS policy
  [ ] TypeScript type mismatch
  [ ] Environment variable / config
  [ ] AI scoring pipeline
  [ ] Third-party package

**Hypothesis:**
[2–3 sentences explaining exactly what you think is wrong and why]

**Alternative causes to rule out:**
- [alternative 1]
- [alternative 2]
```

Wait for confirmation before proceeding to Step 3.

### Step 3 — Diagnosis (deeper investigation)

Based on the triage, investigate the suspected root cause:

**For UI bugs:**
- Check for missing `"use client"` directive
- Check for hydration mismatches (server vs client render)
- Check Tailwind class conflicts or missing responsive prefix
- Check for missing loading / error states

**For data fetching bugs:**
- Log the raw Supabase response before any transformation
- Check if RLS policy is blocking the query
- Check if the correct client is used (server vs browser vs service role)
- Check if `user_id` filter matches `auth.uid()`
- Verify the table and column names against the migration files

**For API route bugs:**
- Check request method matches (`GET` vs `POST`)
- Check `req.json()` is awaited
- Check environment variables are set on Vercel (not just `.env.local`)
- Check CORS headers if called from client

**For AI scoring pipeline bugs:**
- Check if the AI response is valid JSON (log raw response)
- Check if Zod schema validation is failing (log the parse error)
- Check temperature and model name in the scorer
- Check if `OPENAI_API_KEY` (or equivalent) is set in the environment
- Check if the `submissions` table `status` column shows `'failed'`

**For Supabase / RLS bugs:**
- Test the query in the Supabase dashboard SQL editor first
- Check RLS policies with `auth.uid()` set manually
- Check if service role is needed but anon key is being used
- Check for missing `.eq('user_id', userId)` filters

Output:
```
## Diagnosis

**Confirmed root cause:** [specific explanation with file + line reference]
**Evidence:** [what you found that confirms this]
**Proposed fix:** [describe in plain English before writing any code]
**Files to change:** [list — keep it minimal]
**Files NOT to change:** [list anything adjacent that should be left alone]
```

Wait for approval before proceeding to Step 4.

### Step 4 — Fix

Apply the fix following these rules:

- Change ONLY the files listed in the diagnosis
- Add a comment above the fix:
  ```ts
  // Fix: [one-line description of what was wrong]
  // [date]
  ```
- If the fix requires a new Supabase migration, follow
  `supabase_schema_rls.md` conventions
- If the fix touches a component, follow `ui_ux_conventions.md`
- If the fix touches a route, follow `nextjs_app_router.md`
- If the fix touches the scoring pipeline, follow
  `ai_scoring_pipeline.md`

### Step 5 — Verification

After the fix, always output:

```
## Verification steps

**How to confirm the fix worked:**
1. [specific step — e.g. "go to /writing/[id] and submit an essay"]
2. [expected outcome — e.g. "score appears within 20 seconds"]
3. [edge case to check — e.g. "try with an essay under 250 words"]

**Regression check:**
- [what existing functionality could be affected]
- [how to confirm it still works]

**If the fix did NOT work:**
- [next hypothesis to investigate]
```

### Step 6 — Log

Append to `.agent/session_handoff.md`:

```markdown
## Bug fixed: [short title]
- **Root cause:** [one sentence]
- **Files changed:** [list]
- **Fix summary:** [one sentence]
- **Verified by:** [how it was confirmed]
```

---

## Common bug patterns in this stack

### "Data not showing on page"
Most likely causes in order:
1. RLS policy blocking the query → test in Supabase dashboard
2. Wrong Supabase client (browser client in server component)
3. Missing `await` on async Supabase call
4. `user_id` filter not matching session user

### "Auth not working / user always null"
Most likely causes:
1. Middleware not protecting the route
2. Server component using browser Supabase client
3. Session not being passed to server correctly
4. Missing `NEXT_PUBLIC_SUPABASE_URL` or `ANON_KEY` on Vercel

### "AI scoring not returning results"
Most likely causes:
1. `status: 'failed'` in submissions table → check `error_message` column
2. API key not set in Vercel environment variables
3. Zod schema mismatch with AI output → log raw response
4. Timeout — AI call exceeds Vercel function timeout (default 10s)

### "Works locally, broken on Vercel"
Most likely causes:
1. Environment variable not set in Vercel dashboard
2. `SUPABASE_SERVICE_ROLE_KEY` missing (never auto-deployed)
3. Vercel function timeout (upgrade to 60s for AI routes)
4. Edge runtime incompatibility with a package

### "TypeScript error on build"
Most likely causes:
1. Supabase-generated types are out of date → run `supabase gen types`
2. `null` not handled in a data fetch result
3. Client component imported into server component
4. Missing type in `src/types/`

### "Hydration mismatch"
Most likely causes:
1. Date/time rendered differently on server vs client
2. `Math.random()` or `Date.now()` used in render
3. Browser extension modifying the DOM
4. Missing `"use client"` on a component using browser APIs

---

## Emergency fix protocol

If production is broken and you need a fast fix:

```
EMERGENCY FIX — production is broken.

Error: [paste full error]
URL: [affected page or API route]

Skip the full diagnosis process. Give me:
1. The most likely cause (one sentence)
2. The minimal code change to restore functionality
3. Whether a Vercel redeploy is needed
4. A follow-up task to fix it properly

Do not refactor. Do not improve. Restore only.
```

---

## Checklist before marking a bug as fixed

- [ ] Root cause identified and documented
- [ ] Minimal change applied (no unrelated edits)
- [ ] Fix comment added to changed code
- [ ] Verification steps completed
- [ ] Regression check done
- [ ] `session_handoff.md` updated
- [ ] If schema changed: new migration file created
- [ ] If Vercel env var needed: flagged to add in dashboard
