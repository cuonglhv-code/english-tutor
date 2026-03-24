# Codebase Summary

_Last updated: 2026-03-24_

## 1. Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Auth) using `@supabase/ssr`
- **Styling:** Tailwind CSS + Radix UI (Shadcn/UI components) + Framer Motion
- **Deployment:** Vercel / Netlify
- **Workflows:** Formalized development workflows in `.agent/workflows/`
- **Key packages:**
  - `next`: ^15.2.3
  - `@supabase/ssr`, `@supabase/supabase-js`: Supabase integration
  - `@anthropic-ai/sdk`: AI scoring via Claude 3.5 Sonnet
  - `framer-motion`: Smooth UI animations
  - `lucide-react`: Icon system
  - `recharts`: Data visualization for student progress
  - `resend`: Email delivery (likely for results/notifications)
  - `zod`: Schema validation

## 2. App Purpose

An AI-powered IELTS preparation platform that provides automated writing examination, interactive quizzes, and personalized learning paths. It specifically focuses on scoring essays against official IELTS band descriptors (May 2023 update) using Claude 3.5 Sonnet, providing detailed bilingual (English/Vietnamese) feedback to students.

## 3. Routing Structure

| Route | Purpose |
|---|---|
| `/` | Multi-step writing assessment wizard |
| `/login` / `/register` | Authentication pages |
| `/dashboard` | Student progress overview and submission history |
| `/personal-details` | Onboarding form forced for new users |
| `/writing-101` | Educational content on IELTS writing |
| `/practice` | Practice library for Task 1 and Task 2 |
| `/quiz` | Interactive grammar and vocabulary quizzes |
| `/tutor` | AI-assisted tutoring interface |
| `/experience` | Central hub for interactive games and challenges |
| `/vocabulary-challenge` | Vocabulary game embedded via iframe |
| `/placement` | Initial level assessment flow |
| `/admin` | Dashboard for administrators to monitor submissions |
| `/api/analyze` | Main AI scoring endpoint |

## 4. Supabase Schema (key tables)

| Table | Purpose |
|---|---|
| `profiles` | User profile data, including role and onboarding status. |
| `essay_submissions` | Stores user-submitted essays, word counts, and metadata. |
| `feedback_results` | Stores AI-generated band scores and structured JSON feedback. |
| `quiz_leaderboard` | Stores high scores and rankings for the quiz system. |

**RLS & Initialization:**
- **RLS:** Enabled on all tables. Users can only view their own profiles, submissions, and feedback.
- **Client Init:**
  - `lib/supabase.ts`: `createBrowserClient` for client-side interactions.
  - `lib/supabase-server.ts`: `createClient` (session-aware) and `createServiceClient` (admin/service-role) for server-side logic.

## 5. Authentication Flow

- **How users sign up / log in:** Supabase Magic Link / Auth.
- **Where session is checked:** `middleware.ts` handles redirects to `/login` for protected routes.
- **Auth state:** Passed to server components using `@supabase/ssr` with cookie-based session awareness.
- **Onboarding Gate:** Middleware forces users to `/personal-details` if `profile_completed` is false.

## 6. Key Data Flows

1. **Essay Assessment Flow**: User completes the multi-step wizard on the landing page or practice page. The essay is sent to `POST /api/analyze`.
2. **AI Scoring Pipeline**: `api/analyze` calls Anthropic SDK (Claude 3.5 Sonnet) with a detailed system prompt defining IELTS scoring rigour. The response is validated, transformed into a structured format, and saved to Supabase (`essay_submissions` + `feedback_results`).
3. **Progress Tracking**: The dashboard fetches data from the `user_progress` view in Supabase, which aggregates scores from `feedback_results` to show average bands over time.
4. **Onboarding Flow**: On first login, the `handle_new_user` Postgres trigger creates a profile. Middleware detects `profile_completed: false` and redirects to the onboarding form.

## 7. Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server-only)
- `ANTHROPIC_API_KEY` (Server-only)
- `RESEND_API_KEY` (Likely for notifications)
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` (Default 'en')
- `GOOGLE_SHEET_ID` (Legacy logging)

## 8. Component Conventions

- **Structure:** Atomic/Feature-based inside `components/` (e.g., `ui/` for Radix wrappers, `writing/` for specific features).
- **Naming:** PascalCase for React components, kebab-case for folders.
- **UI Library:** Shadcn/UI (Radix + Tailwind) is used for foundational components.

## 9. Testing & Linting

- **Linting:** ESLint with `eslint-config-next`. Run via `npm run lint`.
- **Scripts:** `seed:quiz` exists for database seeding (using `ts-node`).
- **Testing:** No formal test framework (Vitest/Jest) found, but custom scripts are present in `scripts/`.

## 10. Known Quirks & Constraints

- **Node.js Internals:** `googleapis` is pinned as an external package in `next.config.mjs` because it relies on Node.js modules not available in edge/browser environments.
- **Router Cache:** Next.js 15 `staleTimes` are explicitly set to 30s (dynamic) and 300s (static) to prevent aggressive re-fetching on navigation.
- **CSP Headers:** Specific Content-Security-Policy is set for `/vocabulary-challenge` to allow internal scripts and external Tailwind/Fonts.
- **AI Timeout:** `api/analyze` has a 55s timeout.
- **Mobile Navigation:** Uses a hamburger menu and sliding drawer for all authenticated and public links on small screens.
- **Responsive Writing Interface:** Uses a tabbed view (Question vs. Essay) on mobile instead of the desktop split-pane to ensure readability and focus.
- **Legacy Logging:** Still appends some data to Google Sheets.
