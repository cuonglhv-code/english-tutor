---
name: ielts-codebase-orchestrator
description: >
  Use this skill when the user asks a general question about the jaxtina-ielts-examiner
  codebase, wants to understand its architecture, navigate its structure, plan a new
  feature, or doesn't clearly match a more specific IELTS skill. Acts as the entry
  point that routes to the right specialist skill.
---

# IELTS Examiner — Codebase Orchestrator

## Goal
Orient yourself in the workspace and route the user's intent to the correct
specialist skill. Prevent hallucination by reading real files before answering.

## Stack Reference
- **Framework**: Next.js (App Router)
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions)
- **Deployment**: Vercel
- **Language**: TypeScript (strict mode)
- **Styling**: (read `package.json` to confirm — Tailwind or existing UI lib)

## Instructions

1. **Read the workspace first** — before answering any architecture question,
   read `package.json`, `app/` directory tree, and `supabase/migrations/` to
   ground your response in the actual codebase state.

2. **Route to a specialist skill** based on the user's intent:
   | Intent | Route to Skill |
   |---|---|
   | DB schema change / migration | `ielts-supabase-migration` |
   | AI scoring logic / prompt tuning | `ielts-ai-scoring` |
   | New UI component / page | `ielts-component-generator` |
   | LMS integration work | `ielts-lms-integration` |

3. **For general tasks** not covered above (e.g. routing, auth, API routes),
   follow the constraints below directly.

## General Coding Constraints
- All new files must be TypeScript with strict types — no `any` without a comment
- Reuse existing components from the UI library already present in this workspace
- Never modify `.env` or `.env.local` — surface new vars as a separate Artifact list
- Commit format: `[scope]: description` (e.g. `feat(scoring): add band 9 feedback`)
- Every new Next.js API route must include error handling and a loading state
