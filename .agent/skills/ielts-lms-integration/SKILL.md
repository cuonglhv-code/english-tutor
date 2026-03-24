---
name: ielts-lms-integration
description: >
  Use this skill when the user is working on integrating LMS features into the
  jaxtina-ielts-examiner — including course management, student enrollment,
  progress tracking, role-based dashboards, or connecting the AI examiner to
  LMS course modules. Also use when referencing the lite-lms repo for features
  to port.
---

# IELTS Examiner — LMS Integration

## Goal
Safely integrate LMS capabilities from the `lite-lms` reference codebase into
this workspace without breaking any existing IELTS examiner functionality.

## Architecture Reference
Read `.agent/skills/ielts-lms-integration/references/integration_architecture.md`
for the approved integration plan. If this file is empty or missing, do NOT
proceed — ask the user to run the planning phase from the master prompt first.

## User Roles
| Role | Capabilities |
|---|---|
| `student` | Enroll in courses, submit essays, view own scores |
| `teacher` | Create/manage courses, view student submissions, give feedback |
| `admin` | Full access, manage users, view analytics |

Roles are stored in the Supabase `profiles` table under a `role` column.
Always enforce roles via RLS — never rely on client-side role checks alone.

## LMS Core Data Model
When building LMS features, the minimum required tables are:
- `courses` — id, title, description, teacher_id, status, created_at
- `modules` — id, course_id, title, order_index, created_at
- `enrollments` — id, student_id, course_id, enrolled_at, status
- `activities` — id, module_id, type (essay|quiz|reading), config_json
- `activity_submissions` — id, activity_id, student_id, linked to `submissions`

Use the `ielts-supabase-migration` skill for all schema changes.

## Instructions

1. **Read the current workspace structure** before implementing any LMS feature
   to check what already exists — never duplicate pages or API routes.

2. **Reference `lite-lms` for logic only** — the reference clone is at
   `../lite-lms-ref/`. Read it for business logic, but adapt all code to match
   this workspace's conventions (TypeScript, Supabase client patterns, App Router).

3. **Connect IELTS examiner to LMS** via the `activities` table:
   - An essay activity (`type: 'essay'`) stores its config in `config_json`
     (task_type: 'task1'|'task2', word_limit, time_limit)
   - On submission, write to both `submissions` (AI scoring) AND
     `activity_submissions` (LMS progress tracking)

4. **After each LMS feature**, verify the examiner flow still works end-to-end
   using the Browser Sub-Agent on localhost before committing.

## Constraints
- Never remove or rename existing `submissions` table columns
- LMS pages must follow the same layout wrapper as existing pages
- Do not introduce server-side session logic that conflicts with Supabase Auth
- Surface all required new env vars as an Artifact — never add them to `.env`
