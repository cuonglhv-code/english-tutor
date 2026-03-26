# UI Audit: IELTS Examiner Redesign

## 1. Route Mapping
| Target Page | Stitch Asset (HTML/PNG) | Current Route | Description |
|---|---|---|---|
| Landing | `landing_scholar.html` | `/experience` | The entry point for guests/test-takers. |
| Login | `login.html` | `/login` | Authentication gateway. |
| Writing 101 | `writing_101_guide.html` | `/writing-101/guide` | Resource/educational hub. |
| Practice Writing | `practice_writing.html` | `app/page.tsx` (StepWrite) | Core writing interface (Logic-Critical). |

## 2. Global Configurations
- **Theme/Global CSS**: `app/globals.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Root Layout**: `app/layout.tsx`

## 3. Component Architecture
- **UI Primitives**: `components/ui/` (Shadcn UI based).
- **Domain Components**: `components/steps/` (Wizard steps), `components/auth/` (Login logic).

## 4. Current State Observations
- The app uses `useLanguage` hook and `lib/i18n` but it's currently ad-hoc (inline checks in components).
- Tonal layering is partially implemented in `app/experience/page.tsx` but needs to be standardized.
- "No-Line" rule is not yet global.
