---
description: Workflow for building, modifying, and chaining the IELTS AI scoring pipeline.
---

# name: AI Scoring Pipeline
# description: Workflow for building, modifying, and chaining the IELTS AI scoring pipeline.

## Role
You are a senior AI engineer working on an IELTS writing scoring pipeline.
Before making any changes, read the existing scoring logic and prompt files.
This pipeline handles real student data — be conservative, test thoroughly.

---

## Pipeline architecture

The scoring pipeline has these stages. Each stage is a separate concern:

```
 Essay submitted by user (client)
        ↓
 Route Handler: app/api/analyze/route.ts
    - Validates input
    - Checks auth (user must be authenticated)
    - Writes pending submission to Supabase
        ↓
 Scoring Logic: lib/analyze.ts
    - Loads the prompt components
    - Calls AI provider (Anthropic)
    - Parses and validates the structured response
        ↓
 Score normaliser: lib/utils.ts (roundToHalfBand)
    - Maps raw AI output to IELTS band descriptors (0–9 scale)
    - Validates scores are within legal range
        ↓
 Supabase write (service role)
    - Writes final score + feedback to `essay_submissions` table via `persistToSupabase`
    - Updates `feedback_results` table with per-criterion breakdown
        ↓
 Client receives result
```

---

## Stage 1 — Prompt template rules

Prompt components currently live in: `app/api/analyze/route.ts` (as constants) and `lib/descriptors.ts`.

Rules:
- Currently using `SYSTEM_PROMPT` and `buildUserPrompt` functions.
- Use `{{placeholders}}` for dynamic values (essay text, word count, etc.) if extracted to separate files.
- Never hardcode band descriptors inline — import from `lib/descriptors.ts`.
- Version prompts with a comment header if moved to static files.
- When modifying a prompt, always test on several sample essays before committing.

Prompt output must be structured JSON (Bilingual EN/VI):
```json
{
  "task_achievement_band": <number>,
  "coherence_cohesion_band": <number>,
  "lexical_resource_band": <number>,
  "grammatical_range_accuracy_band": <number>,
  "overall_band": <number>,
  "feedback": {
    "task_achievement": { "strengths": "...", "improvements": "...", "band_justification": "...", "strengths_vi": "...", ... },
    ...
  }
}
```

---

## Stage 2 — AI provider call pattern (Anthropic)

```ts
// app/api/analyze/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey });
const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [{ role: "user", content: userPrompt }],
  system: SYSTEM_PROMPT,
});
```

Key rules:
- Always check `ANTHROPIC_API_KEY` before calling.
- Always validate AI output with a validation function (`validateAIResponse`) before writing to DB.
- Handle timeouts (currently 55s) and fall back to rule-based scoring (`analyzeEssay` in `lib/analyze.ts`) on failure.
- Never expose the raw AI response to the client — always transform to `AnalysisResult` first.

---

## Stage 3 — Chaining workflows

When building a new pipeline feature, chain these workflows in order:

```
Step 1: supabase_schema_rls.md
  → Create any new tables / columns needed for the feature (e.g., migrations)

Step 2: nextjs_app_router.md
  → Create the Route Handler and any new page components

Step 3: ai_scoring_pipeline.md (this file)
  → Build the scoring logic, prompts, and Supabase writes

Step 4: start_session.md end-of-session routine
  → Update CODEBASE_SUMMARY.md and session_handoff.md
```

---

## Error handling pattern

Every pipeline stage must handle failure gracefully:

```ts
try {
  // AI analysis...
} catch (aiErr) {
  // Fallback to rule-based scoring...
  result = analyzeEssay(data);
  result.scoring_method = "rule_based_fallback";
} finally {
  // Persist result (AI or fallback) to DB
  await persistToSupabase(data, result, feedbackToStore);
}
```

---

## Checklist before deploying any pipeline change

- [ ] AI output validated with `validateAIResponse`
- [ ] Error handling falls back to rule-based engine
- [ ] Service role key used for DB writes (`createServiceClient`)
- [ ] Tested on Task 1 and Task 2 samples
- [ ] Band scores rounded to 0.5 increments (`roundToHalfBand`)
- [ ] No raw AI output exposed to client
- [ ] `CODEBASE_SUMMARY.md` updated if schema changed
