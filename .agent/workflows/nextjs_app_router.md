---
description: Enforce correct App Router patterns and prevent Pages Router mixups.
---

# name: Next.js App Router Conventions
# description: Enforce correct App Router patterns and prevent Pages Router mixups.

## Role
You are a Next.js specialist. This project uses the APP ROUTER exclusively.
Never use Pages Router patterns. When in doubt, check `src/app/` (or `app/`) exists
before writing any code.

---

## Directory structure rules

```
app/                         # App Router root — all routes live here
├── layout.tsx               # Root layout (HTML shell, providers)
├── page.tsx                 # Home route /
├── (auth)/                  # Route group — auth pages, no layout segment
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── layout.tsx           # Dashboard-specific layout
│   └── page.tsx
├── writing/
│   └── [id]/page.tsx        # Dynamic route
└── api/                     # API routes (Route Handlers)
    └── score/route.ts
components/                  # Shared UI components (always client or server, labelled)
lib/                         # Utilities, Supabase clients, helpers
hooks/                       # Custom React hooks (always client-side)
types/                       # Shared TypeScript interfaces
```

---

## Component rules

### Server Component (default)
- No `"use client"` directive needed
- Can use `async/await` directly
- Can call Supabase server client directly
- Cannot use hooks, event handlers, or browser APIs

```tsx
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('submissions').select('*')
  return <SubmissionList items={data} />
}
```

### Client Component
- Must have `"use client"` as the FIRST line
- Use for: hooks, event handlers, browser APIs, interactive UI
- Keep client components as small/leaf as possible

```tsx
"use client"
import { useState } from 'react'

export function EssayEditor({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')
  return <textarea value={text} onChange={e => setText(e.target.value)} />
}
```

---

## Route Handler rules (API routes)

```
app/api/{{name}}/route.ts   ← correct
pages/api/{{name}}.ts       ← WRONG — Pages Router, never use
```

```ts
// app/api/score/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  // ... logic
  return NextResponse.json({ score: 7 })
}
```

---

## Data fetching patterns

| Pattern | When to use |
|---|---|
| `async` server component + direct Supabase call | Page-level data, no interactivity |
| Server Action (`"use server"`) | Form submissions, mutations |
| Route Handler (`/api/`) | Called from client components or external services |
| Client-side `useEffect` + Supabase browser client | Real-time subscriptions only |

Never use `getServerSideProps` or `getStaticProps` — those are Pages Router.

---

## Metadata

```tsx
// In any page.tsx or layout.tsx
export const metadata = {
  title: 'IELTS Writing Examiner',
  description: '...',
}
```

---

## Checklist before submitting any new route or component

- [ ] File is in `app/` not `pages/`
- [ ] `"use client"` only added where truly needed
- [ ] Server components fetch data directly (no useEffect for initial load)
- [ ] API routes are in `app/api/*/route.ts`
- [ ] No `getServerSideProps` / `getStaticProps` anywhere
- [ ] TypeScript types defined in `types/` and imported
