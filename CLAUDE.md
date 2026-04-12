# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Skills

Before starting any task, check the available agent skills for relevant guidance. Use the `Skill` tool to invoke them. Key skills for this repo:

| Task area | Skill to invoke |
|---|---|
| Next.js App Router patterns | `vercel:nextjs` |
| Deploying to Vercel | `vercel:deploy` |
| Supabase / storage | `vercel:vercel-storage` |
| Auth patterns | `vercel:auth` |
| Middleware changes | `vercel:routing-middleware` |
| Anthropic / Claude API | `claude-api` |
| AI SDK (streaming, tools) | `vercel:ai-sdk` |
| shadcn/ui components | `vercel:shadcn` |
| Environment variables | `vercel:env` |
| Feature development | `feature-dev:feature-dev` |
| Code review | `code-review:code-review` |
| Commit + push + PR | `commit-commands:commit-push-pr` |

For tasks not covered above, scan the full skill list with the `Skill` tool or check the system-reminder at the top of the conversation — skills are auto-suggested based on file patterns and prompt content.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run seed:quiz    # Seed quiz questions into Supabase (ts-node)
```

No test suite is configured. Type-check with `npx tsc --noEmit`.

## Architecture Overview

**Jaxtina IELTS Tutor** — AI-powered IELTS writing practice app. Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth), Anthropic Claude for AI scoring.

### i18n Routing

All pages live under `app/[lang]/` (locales: `en`, `vi`). The root `app/layout.tsx` is a passthrough shell. The middleware redirects every bare path (e.g., `/dashboard`) to `/{locale}/dashboard`. Never create pages at `app/page.tsx` or other non-`[lang]` paths — use `app/[lang]/`.

Translations are in `lib/i18n.ts` as a nested `{ en: "...", vi: "..." }` object. The locale config lives in `lib/i18n/i18n-config.ts`. To access the current locale in a Server Component, read it from `params.lang` (which is a `Promise<{ lang: Locale }>` in Next.js 15).

### Middleware (`middleware.ts`)

Handles four concerns in order:
1. **Locale redirect** — redirects paths without a locale prefix
2. **Auth guard** — unauthenticated users → `/login` for non-public routes
3. **Profile-completion gate** — new users without `profile_completed = true` → `/personal-details`
4. **Admin guard** — `/admin/*` requires `role = 'admin'` in the `profiles` table

`PUBLIC_ROUTES` matches by prefix; `EXACT_PUBLIC_ROUTES` matches exactly (used for `/placement` intro only). `PROFILE_EXEMPT` lists routes new users can access before completing their profile.

The middleware matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and `*.html` files.

### Supabase Client Factories

Three clients in `lib/`:

| Factory | File | Key | Use |
|---|---|---|---|
| `createBrowserClient()` | `lib/supabase.ts` | anon | Client Components, browser-side |
| `createClient()` | `lib/supabase-server.ts` | anon + cookies | Server Components, API routes (session-aware) |
| `createServiceClient()` | `lib/supabase-server.ts` | service_role | Admin operations, bypasses RLS |

**Never** use `createServiceClient()` in Client Components or expose the service role key to the browser.

### AI Scoring Pipeline

`app/api/analyze/route.ts` is the primary scoring endpoint:
- Sends the essay to **Claude** (`claude-sonnet-4-*`) with IELTS Band Descriptor system prompt
- Times out after 55 seconds (bilingual 4096-token responses can take 30–45 s)
- Falls back to the **rule-based engine** in `lib/analyze.ts` if the Claude call fails
- The scoring method (`ai_examiner` or `rule_based_fallback`) is stored in the DB and shown as a badge

The placement test has its own set of routes under `app/api/placement/` and components under `components/placement/`. The placement intro page (`/placement`) is public; the test and results require auth.

### Database

Migrations are in `supabase/migrations/`. Run them manually via the Supabase SQL Editor — there is no CLI migration runner configured. Files are numbered sequentially (some have duplicate prefix numbers from parallel development; this is intentional legacy state).

Key tables: `profiles`, `essay_submissions`, `feedback_results`, `placement_tests`, `quiz_questions`, `consultation_bookings`, `guest_users`.

The `profiles` table has a `profile_completed` boolean and a `role` column (`'user'` | `'admin'`). An `on_auth_user_created` trigger auto-creates a profile row on signup.

### Key `lib/` Files

- `lib/analyze.ts` — rule-based fallback scoring engine (word count, vocabulary, grammar heuristics)
- `lib/descriptors.ts` — IELTS band descriptor lookup used by both AI prompt and rule-based engine
- `lib/i18n.ts` — all EN/VI UI strings
- `lib/placementBands.ts` — raw score → band conversion for placement test
- `lib/studyPlanConfig.ts` — entry band × goal band → study plan recommendation matrix
- `lib/utils.ts` — `roundToHalfBand()` and shadcn `cn()` utility

### Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `ANTHROPIC_API_KEY` | Anthropic API key (server-only) |
| `NEXT_PUBLIC_APP_URL` | Full origin URL — required for server-to-server calls in the placement submit route |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | Default locale (`en` or `vi`) |

### `next.config.mjs` Notes

- `googleapis` is excluded from the webpack bundle (`serverExternalPackages`)
- `staleTimes` is set to restore Next.js 14-style client router cache (`dynamic: 30`, `static: 300`) because Next.js 15 defaults cause visible re-fetches
- CSP headers are applied to `/vocabulary-challenge` routes only
