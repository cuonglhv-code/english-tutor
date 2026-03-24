---
name: ielts-ai-scoring
description: >
  Use this skill when the user wants to modify, debug, or extend the IELTS AI 
  examiner scoring logic — including band score calculation, feedback generation,
  prompt engineering for the LLM, Writing Task 1 or Task 2 evaluation criteria,
  or storing/retrieving scores from Supabase.
---

# IELTS Examiner — AI Scoring Logic

## Goal
Maintain and extend the AI scoring engine in a way that is accurate, consistent
with official IELTS band descriptors, and integrated with the Supabase data layer.

## IELTS Scoring Model
The scoring engine follows the **Best Fit** principle used by trained examiners: award the band that most accurately reflects the overall quality, even if minor limiting features are present.

The four marking criteria (equal weight, 25% each):
1. **Task Achievement / Task Response** (TA/TR)
2. **Coherence and Cohesion** (CC)
3. **Lexical Resource** (LR)
4. **Grammatical Range and Accuracy** (GRA)

Overall band = average of four criteria, rounded to nearest 0.5.

## Existing Prompt Architecture
The system uses a two-stage or role-specific pipeline depending on the task:

- **Core Marking Engine**: `app/api/analyze/route.ts` (Handles both Task 1 & 2 essays).
- **Vision Extraction**: `app/api/task1/extract/route.ts` & `app/api/task1/score/route.ts`.
- **LLM Model**: `claude-3-5-sonnet-20241022` (Anthropic).
- **Call Parameters**: `max_tokens: 4096`, `timeout: 55,000ms`.

### Locked JSON Schema (Downstream Dependencies)
The following fields in the AI response are **LOCKED** and must never be renamed:
- `task_achievement_band`, `coherence_cohesion_band`, `lexical_resource_band`, `grammatical_range_accuracy_band`, `overall_band`.
- `feedback`: Contains nested objects `task_achievement`, `coherence_cohesion`, etc., with `strengths`, `improvements`, `band_justification` (and their `_vi` counterparts).
- `priority_actions` & `priority_actions_vi`.
- `overall_comment` & `overall_comment_vi`.

## Task-Specific Marking Instructions

### Task 1 (Academic/General — Data Description)
**System Role**: Expert IELTS examiner specialising in Writing Task 1 visual analysis.
**Prompt Logic**:
- **Extraction Phase**: Must classify visual as `statistical_chart`, `process_diagram`, `map`, or `mixed`.
- **Critical Features**: Must identify "Mandatory Overview Content" (macro-features for B7+) and "Essential Body Detail".
- **Statistical Focus**: Peaks, lowest values, crossovers, and overall trends.
- **Process Focus**: Linear vs Cyclical, total stages, and key transformations.
- **Map Focus**: Named regions, spatial changes over time, and unchanged elements.

### Task 2 (Essay — Opinion/Argument/Discussion)
**System Role**: Senior IELTS Examiner and bilingual (English–Vietnamese) writing mentor.
**Scoring Philosophy**:
- **Borderline Scripts**: Award the higher band when positive features are clearly demonstrated.
- **Charitable Interpretation**: Credit communicative achievement if meaning is recoverable.
- **Feedback Sequence**: Lead with recognition (Strengths) -> Diagnose gaps -> Concrete Actions.
- **Bilingual Requirement**: Vietnamese translations must be natural and idiomatic, not literal.

## Instructions

1. **Read the current scoring modules** at `app/api/task1/` and `app/api/analyze/` before making any changes. Understand the `SYSTEM_PROMPT` constants in both.

2. **Prompt engineering rules**:
   - Always instruct the LLM to score each of the 4 criteria separately before giving an overall band.
   - Use structured output (JSON schema) so scores are machine-parseable — never rely on free-text parsing.
   - Include the word count in the prompt context (Task 1 min 150w, Task 2 min 250w).
   - Penalise under-length submissions as per official IELTS policy ($N$ words under = specific band reduction logic).

3. **Supabase storage**: Every submission writes to:
   - `essay_submissions`: Metadata, prompt, essay text.
   - `feedback_results`: Band scores and the `feedback_json` (bilingual).

4. **Feedback structure**: Must include:
   - An overall band score.
   - Per-criterion scores with 1-2 sentence justification.
   - 3 specific, actionable improvement suggestions.

5. **Testing a scoring change**:
   - If no automated test script is found in `package.json`, create a temporary test script or use the Browser Sub-Agent to submit sample essays on localhost.
   - Verify the returned band is within ±0.5 of expected expert markers.
   - Check that Vietnamese translations are fully populated and not truncated.

## Constraints
- **Model Lock**: Use `claude-3-5-sonnet-20241022` unless instructed otherwise.
- **No free-text bands**: All scoring must be integers/half-floats within the 1.0-9.0 range.
- **JSON Integrity**: Never return markdown fences (```json) inside the string if the parser doesn't handle them; strip them if the LLM includes them.
- **Timeout Awareness**: Be mindful that bilingual marking takes 30-45s; keep payloads efficient.

## Prompt Change Protocol
1.  **Extract** current prompt from `app/api/[route]/route.ts`.
2.  **Compare** with official Band Descriptors in `.agent/skills/ielts-ai-scoring/references/`.
3.  **Deploy** to a dev route first to verify JSON schema stability.
4.  **Audit** bilingual output for translation quality before merging to main.
