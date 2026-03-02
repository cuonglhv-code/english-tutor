# Jaxtina IELTS Writing Examiner

AI-powered IELTS Writing practice: instant band scores, criterion-by-criterion feedback, bilingual EN/VI interface, and a personal progress dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI Scoring | Anthropic API (`claude-sonnet-4-20250514`) |
| Database | Supabase (Postgres + Auth) |
| Charts | Recharts |
| Fallback scoring | Rule-based engine (`lib/analyze.ts`) |

---

## Deployment

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   This creates `profiles`, `essay_submissions`, `feedback_results` tables, the `user_progress` view, RLS policies, and the auto-profile trigger.
3. From **Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Supabase Auth Configuration

- In **Authentication → Providers**, enable **Email** (enabled by default).
- To enable **Google OAuth**:
  1. Create a Google OAuth 2.0 client ID at [console.cloud.google.com](https://console.cloud.google.com).
  2. Set the Authorized Redirect URI to:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
  3. In Supabase **Authentication → Providers → Google**, enter your Client ID and Secret.
- In **Authentication → URL Configuration**, add your production domain to **Redirect URLs**:
  ```
  https://yourdomain.com/auth/callback
  ```

### 3. Anthropic API Key

1. Log in to [console.anthropic.com](https://console.anthropic.com).
2. Create an API key → copy as `ANTHROPIC_API_KEY`.

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (server-only) |
| `ANTHROPIC_API_KEY` | console.anthropic.com (server-only) |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | `en` or `vi` |

Google Sheets variables are optional (legacy feature).

### 5. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard and set environment variables under **Settings → Environment Variables**.

**Important**: `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` must be set as **server-side only** (not exposed to the browser). In Vercel, leave the "expose to browser" checkbox unchecked for these.

### 6. Manual Supabase Dashboard Steps Required

After running the migration, perform these steps in the Supabase dashboard:

- [ ] **Enable RLS** on all three tables (the migration does this, verify in Table Editor → RLS).
- [ ] **Confirm the trigger** `on_auth_user_created` exists in Database → Triggers.
- [ ] If using Google OAuth: set up the provider as described in Step 2.
- [ ] Optionally set **password strength** policy in Authentication → Settings.
- [ ] Grant `SELECT` on `user_progress` view to `authenticated` role (included in migration).

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                  # 4-step wizard (home)
  results/page.tsx          # Results display
  login/page.tsx            # Email/password login
  register/page.tsx         # User registration
  dashboard/page.tsx        # Authenticated dashboard
  dashboard/submission/[id] # Submission detail view
  api/analyze/route.ts      # AI + fallback scoring API
  auth/callback/route.ts    # OAuth callback handler

components/
  Navbar.tsx                # Navigation + language toggle + auth
  DarkModeToggle.tsx
  steps/                    # Wizard steps
  results/                  # Results components
  dashboard/                # Dashboard components
  ui/                       # shadcn/ui primitives

lib/
  analyze.ts                # Rule-based fallback scoring engine
  descriptors.ts            # IELTS band descriptors
  i18n.ts                   # EN/VI translation object
  supabase.ts               # Browser Supabase client (anon key)
  supabase-server.ts        # Server Supabase client (service role)
  utils.ts                  # Utility functions

hooks/
  useLanguage.ts            # Language state + localStorage persistence
  useUser.ts                # Supabase auth user hook

supabase/migrations/
  001_initial_schema.sql    # All tables, views, RLS, trigger

types/index.ts              # All TypeScript interfaces
```

---

## Scoring

Essays are scored by the **Anthropic AI Examiner** (`claude-sonnet-4-20250514`) using official IELTS Writing Band Descriptors as a system prompt. If the API call fails or times out (>15s), the app falls back to the **rule-based engine** in `lib/analyze.ts`. The scoring method is displayed as a badge on the results page and stored in the database.

⚠️ This is a simulated examiner — not an official IELTS assessment.
