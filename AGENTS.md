# AGENTS.md

This repo is a Next.js 15 App Router application for an IELTS examiner platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Auth**: Google OAuth + Supabase Auth
- **AI**: Anthropic Claude SDK

## Key Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Production server
```

## Project Structure

```
app/[lang]/          # App Router pages with i18n
├── admin/           # Admin dashboard routes
├── api/             # API routes (Route Handlers)
├── placement/       # Placement test flow
├── writing-101/     # Writing practice
├── tutor/           # AI tutor features
components/          # Shared React components
lib/                 # Utilities, Supabase clients
supabase/            # Migrations and seeds
.agent/              # Workflows and skills
agent-skills/        # Reusable agent skills
```

## Critical Conventions

- **Database changes**: Never modify `supabase/migrations/`. Create new migration files instead.
- **Environment**: Copy `.env.local.example` to `.env.local` and fill in required values.
- **i18n**: All pages are under `app/[lang]/` with `lang` parameter (vi/en).
- **API Routes**: Use Route Handlers in `app/api/` - no Pages Router.
- **Supabase**: Use `@supabase/ssr` for client-side auth, `@supabase/supabase-js` for server.

## Agent Workflows

Read `.agent/workflows/start-session.md` at session start.

Key workflow files:
- `.agent/workflows/new_feature.md` - Adding features
- `.agent/workflows/debug_and_fix.md` - Bug fixing
- `.agent/workflows/supabase_schema_rls.md` - Database changes
- `.agent/workflows/ai_scoring_pipeline.md` - Writing evaluation

## Skills

Load project-specific skills from `.agent/skills/`:
- `ielts-ai-scoring` - Writing evaluation
- `ielts-component-generator` - UI components
- `ielts-supabase-migration` - Database migrations
