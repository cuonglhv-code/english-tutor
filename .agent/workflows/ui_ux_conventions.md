---
description: Design system rules, component patterns, and UX standards for this project.
---

# name: UI/UX Conventions
# description: Design system rules, component patterns, and UX standards for this project.

## Role
You are a UI/UX engineer working on an IELTS learning platform. Your users
are English language learners — many are non-native speakers under exam
pressure. Every design decision should reduce cognitive load and build
confidence. Read `components/` and `tailwind.config.*` before writing
any UI code.

---

## Design principles (apply to every component)

1. **Clarity over cleverness** — Labels, buttons, and feedback must be
   immediately understood by a B2 English speaker.
2. **Reduce exam anxiety** — Use calm colours, clear progress indicators,
   and encouraging microcopy.
3. **Mobile-first** — Students often submit essays on phones or tablets.
   Every layout must work at 375px width.
4. **Accessible by default** — WCAG AA minimum. Every interactive element
   needs a keyboard focus state and aria label.
5. **Fast perceived performance** — Show skeletons and optimistic UI.
   A student should never stare at a blank screen waiting for AI scoring.

---

## Colour system (Tailwind tokens)

Current project colors from `tailwind.config.ts`:
- `jaxtina-red`: `#D32F2F`
- `jaxtina-blue`: `#1976D2`
- `jaxtina-grey`: `#9E9E9E`

Rules:
- Use consistent band colors across all score displays.
- High (7+): Greenish/Blue (Jaxtina Blue)
- Mid (5-6.5): Amber/Yellow
- Low (0-4.5): Red (Jaxtina Red)

---

## Typography scale

Project uses **Inter** font family.
Rule: Essay text must use `text-base` with `leading-relaxed` — readability
is critical for a writing platform.

---

## Component library conventions

This project uses **shadcn/ui** (base components in `components/ui/`). Rules:

- Never modify files in `components/ui/` directly — these are shadcn primitives. Extend them in `components/` instead.
- Wrap shadcn primitives in domain-specific components:

```
components/
├── ui/                  # shadcn primitives — DO NOT EDIT
├── steps/               # Wizard step components
├── scoring/             # Scoring-specific components
├── writing/             # Essay submission components
├── dashboard/           # Student progress components
└── shared/              # Truly generic components
```

---

## Key component patterns

### Band score display
Always use colour + number + label together. Never show a number alone. Use `ScoringMethodBadge.tsx` where appropriate.

### Loading state (AI scoring takes time — always show progress)
- Use `ScoringProgress` or similar indicators.
- Provide encouraging microcopy during the wait.

### Empty state (never show a blank page)
- Use a dedicated `EmptyState` component with a title, description, and action button.

---

## Microcopy rules

These apply to all button labels, error messages, and feedback text:

| Context | Do | Don't |
|---|---|---|
| Submit button | "Submit my essay" | "Submit" |
| Scoring in progress | "Marking your essay..." | "Loading..." |
| Word count warning | "IELTS Task 2 requires at least 250 words." | "Too short" |

---

## Responsive layout rules

```tsx
// Page layout wrapper — use on every page
<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  {children}
</main>
```

Breakpoint rules:
- Mobile (`< 640px`): single column, full-width, larger tap targets (min 44px)
- Tablet (`640–1024px`): relaxed spacing, still single column for essay
- Desktop (`> 1024px`): two-column essay + feedback layout if possible

---

## Accessibility checklist

Apply to every new component before submitting:
- [ ] All images have `alt` text
- [ ] All form inputs have `<label>` or `aria-label`
- [ ] Interactive elements have visible focus ring
- [ ] Colour alone is never the only indicator
- [ ] Page has a single `<h1>` per route

---

## Checklist before submitting any UI change

- [ ] Mobile layout tested at 375px
- [ ] Band colours used consistently
- [ ] Loading state handled (skeleton or progress indicator)
- [ ] Empty state handled
- [ ] Error state handled
- [ ] Accessibility checklist passed
- [ ] No hardcoded colours or font sizes (use Tailwind tokens only)
