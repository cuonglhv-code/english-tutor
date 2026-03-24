---
name: ielts-component-generator
description: >
  Use this skill when the user wants to create a new React/Next.js UI component,
  page, or layout in the jaxtina-ielts-examiner codebase. Also use when adding
  a new form, dashboard widget, or student-facing UI element.
---

# IELTS Examiner — Component Generator

## Goal
Generate new UI components that are fully consistent with the existing codebase's
design system, TypeScript conventions, and component file structure.

## Instructions

1. **Read the existing design system** — before generating, scan the `components/`
   directory to understand: naming patterns, import conventions, prop type style,
   and which UI library is in use.

2. **Follow the golden example** — study the example component at:
   - `examples/ExaminerFeedback.tsx` (component structure, prop types, styling)
   - `examples/ExaminerFeedback.test.tsx` (test structure to replicate)

3. **Generate the component** following these rules:
   - All props must be typed with a named interface (`ComponentNameProps`)
   - Use the existing UI component library (do NOT import from a new library)
   - Loading and error states must be handled in every data-fetching component
   - Use `'use client'` directive only when interactivity requires it;
     prefer Server Components by default

4. **Generate a co-located test file** alongside every new component using
   the test file example as the structural template.

5. **Place the file** in the correct directory:
   - Reusable UI: `components/ui/`
   - Feature-specific: `components/[feature-name]/`
   - Full pages: `app/[route]/page.tsx`

## Constraints
- No inline styles — use Tailwind classes or the existing CSS convention
- No `any` types in props
- Never create a component wider than 100 lines without proposing a split
