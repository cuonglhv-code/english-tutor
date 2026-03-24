---
description: Load codebase context and orient the assistant at the start of every session.
---

# Start Session Workflow

## On every new session, do this first:

1. Read `CODEBASE_SUMMARY.md` in the project root.
2. Read `.agent/session_handoff.md` if it exists (last session's notes).
3. Confirm your understanding by outputting a short 3-bullet summary of:
   - What this app does
   - The current tech stack
   - Any outstanding tasks from the last handoff (if found)

Do not make any changes until you have completed steps 1–3 and the user has confirmed your understanding is correct.

---

## Standing Rules (Whole Session)

- Always read a file before editing it.
- Never modify `supabase/migrations/` — create a new migration file instead.
- Never hardcode secrets or API keys — use environment variables from `.env.example`.
- Never mix App Router and Pages Router patterns.
- For any change affecting the database schema, flag it explicitly before proceeding.
- If a task is ambiguous, ask one clarifying question before starting — do not assume.
- After completing each task, append a summary of what was done to `.agent/session_handoff.md`.

---

## End of Session Routine

When the user says "end session" or "wrap up", do the following:

1. Update `CODEBASE_SUMMARY.md` if anything significant changed.
2. Write/Update `.agent/session_handoff.md` with:

```markdown
# Session Handoff

_Date: {{ISO date}}_

## What was done
- (bullet list of completed tasks with file paths changed)

## Current state
- (brief description of where things stand)

## Next steps
- (bullet list of suggested next tasks, in priority order)

## Blockers / open questions
- (anything unresolved that needs a decision)
```
