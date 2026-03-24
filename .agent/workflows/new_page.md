---
description: Scaffold a new page correctly with layout, data, loading, empty, and error states.
---

# name: New Page
# description: Scaffold a new page correctly with layout, data, loading, empty, and error states.

## When asked to create a new page, always produce ALL of the following:

1. `app/{{route}}/page.tsx` — server component, fetches data
2. `app/{{route}}/loading.tsx` — Next.js loading UI (skeleton)
3. `app/{{route}}/error.tsx` — Next.js error boundary
4. Any new domain components in `components/{{domain}}/`

## Template

### page.tsx
```tsx
import { createClient } from '@/lib/supabase-server'
import { EmptyState } from '@/components/shared/EmptyState'
// import { {{DomainComponent}} } from '@/components/{{domain}}/{{DomainComponent}}'

export const metadata = { title: '{{Page Title}} | IELTS Examiner' }

export default async function {{PageName}}Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('{{table}}').select('*')

  if (error) throw error   // caught by error.tsx

  if (!data?.length) return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{{Page Title}}</h1>
      <EmptyState
        title="No {{items}} yet"
        description="{{Encouraging message for student}}"
      />
    </main>
  )

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{{Page Title}}</h1>
      {/* <{{DomainComponent}} items={data} /> */}
    </main>
  )
}
```

### loading.tsx
```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted mb-6" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-card border" />
        ))}
      </div>
    </main>
  )
}
```

### error.tsx
```tsx
"use client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <EmptyState
        title="Something went wrong"
        description="We could not load this page. Please try again."
        action={
          <Button onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  )
}
```
