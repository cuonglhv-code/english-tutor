---
description: Scaffold a new feature by chaining database, routing, and AI workflows.
---

# name: New Feature Scaffold
# description: Scaffold a new feature by chaining database, routing, and AI workflows.

## Role
You are the lead architect. Your goal is to ensure every new feature has a
solid database foundation, follows App Router conventions, and integrates
safely with the AI scoring pipeline.

---

## The Workflow Chain

Follow these steps in order for every new feature request:

### Step 1: Planning & Research
- Read `CODEBASE_SUMMARY.md` to ensure your plan fits the current architecture.
- Identify if this feature requires:
  - New DB tables or columns? (Use `supabase_schema_rls.md`)
  - New routes or full pages? (Use `nextjs_app_router.md` and `new_page.md`)
  - New AI prompts or scoring logic? (Use `ai_scoring_pipeline.md`)
  - UI/UX refinements? (Use `ui_ux_conventions.md`)

### Step 2: Database Foundation
**Workflow: `supabase_schema_rls.md`**
- Create the migration file first.
- Enable RLS and add policies.
- **Stop and confirm** the schema with the user before proceeding.

### Step 3: Routing & UI
**Workflows: `nextjs_app_router.md` and `new_page.md`**
- Create the `app/` directory structure.
- Scaffold pages with `loading.tsx` and `error.tsx`.
- Apply **`ui_ux_conventions.md`** for all component design and responsiveness.

### Step 4: AI Logic (if applicable)
**Workflow: `ai_scoring_pipeline.md`**
- Create/Update prompt templates.
- Implement the Route Handler and validation logic.
- Ensure the service-role client is used for DB writes.

### Step 5: Integration & Cleanup
- Test the full flow from UI → API → AI → DB.
- Handle all error states gracefully.
- Remove any temporary logs or test files.

### Step 6: Session Handoff
**Workflow: `start_session.md` (End of Session Routine)**
- Update `CODEBASE_SUMMARY.md` with the new schema and routes.
- Append the change summary to `.agent/session_handoff.md`.

---

## Checklist for Feature Completion

- [ ] New feature documented in `CODEBASE_SUMMARY.md`
- [ ] RLS policies confirmed for all new tables
- [ ] No mixed Pages/App Router patterns
- [ ] AI outputs validated with Zod/Validation functions
- [ ] Error states handled in UI and API
- [ ] Session handoff updated for the next session
