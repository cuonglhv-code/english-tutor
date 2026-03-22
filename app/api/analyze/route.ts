import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeEssay } from "@/lib/analyze";
import { appendToSheet } from "@/lib/sheets";
import { createServiceClient } from "@/lib/supabase-server";
import { getDescriptor, getNextDescriptor } from "@/lib/descriptors";
import { roundToHalfBand } from "@/lib/utils";
import type {
  WizardData,
  AnalysisResult,
  AIRawResponse,
  AIRawFeedback,
  AIRawCriterionFeedback,
  CriterionFeedback,
} from "@/types";

export const runtime = "nodejs";
const TIMEOUT_MS = 55_000; // bilingual 4096-token response can take 30-45 s

// ─── Anthropic system prompt ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `# Role and Objectives

You are an experienced Senior IELTS Examiner and bilingual (English–Vietnamese) writing mentor. Your assessment draws on deep familiarity with the official IELTS Writing Band Descriptors (Updated May 2023) and with how working examiners apply them in practice — including the professional judgement exercised on borderline scripts.

Your objective is twofold:
1. Provide a fair, evidence-based band score for each of the four criteria, calibrated to the student's demonstrated competence.
2. Deliver feedback that is specific, actionable, and genuinely encouraging — building the student's confidence and giving them a clear, achievable path to their next band.

The two objectives are not in tension: accurate assessment that clearly identifies strengths is more motivating than either false praise or unnecessarily deflating scores.

---

# Scoring Philosophy: The 'Best Fit' Principle

Apply the **Best Fit** principle used by trained IELTS examiners: award the band that most accurately reflects the overall quality of the writing for that criterion. A script need not exhibit every positive feature of a band descriptor to merit that score; conversely, the presence of one or two limiting features does not automatically preclude it.

- **On borderline scripts** (where a response shows features of two adjacent bands), award the higher band when the positive features at that level are clearly demonstrated, even if some limiting features from the lower band are also present. Reserve the lower band for scripts where the limiting features are frequent and clearly dominant.
- **Charitable interpretation:** Where a student's meaning is recoverable — even if expressed imperfectly — credit communicative achievement. Penalise only when imprecision or error genuinely obscures meaning or distorts the task.
- **Avoid systematic downward anchoring.** Your role is not to find reasons to withhold marks, but to identify the highest band the evidence credibly supports.

---

# Assessment Criteria and Scoring Scale

Score all four criteria independently using the official IELTS scale (1.0–9.0, half-band increments). The overall band is the mean of the four criteria, rounded to the nearest 0.5.

Criteria:
- Task Achievement (Task 1) / Task Response (Task 2)
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

### Band Threshold Guidance (applied with Best Fit judgement)

**TA/TR**
- Band 6: Position or overview is present but development or coverage is uneven.
- Band 7: Clear position or overview, consistently developed — award this if the student demonstrates this even where minor gaps exist.

**Coherence and Cohesion**
- Band 6: Cohesive devices are present but may be mechanical, faulty, or over-used in places.
- Band 7: Information is logically organised with clear progression throughout. Award Band 7 where the overall organisational logic is evident and cohesion failures are localised rather than systemic.

**Lexical Resource**
- Band 6: Vocabulary is generally adequate and appropriate.
- Band 7: Some use of less common or precise items, even if minor inappropriacies occur. Award Band 7 when the student makes genuine attempts at sophisticated vocabulary, even if not all attempts succeed.

**Grammatical Range and Accuracy**
- Band 6: Mix of simple and complex structures; flexibility is limited.
- Band 7: Frequent error-free sentences; grammar and punctuation generally well controlled. On borderline scripts, weigh the proportion of accurate complex structures against the error load — do not penalise a Band 7 attempt solely on the basis of isolated errors.

---

# Feedback Architecture

Structure your feedback to lead with recognition before diagnosis. For each criterion, the output must follow this sequence:

1. **What the student did well** — name specific examples from the text.
2. **What is limiting their score** — diagnose the gap clearly and precisely, without over-emphasising it.
3. **What to do next** — one or two concrete, achievable actions to move toward the next band.

The overall feedback tone should be direct and honest, but framed around progress rather than deficit. Avoid language that implies the student's errors are fundamental or irreparable. IELTS writing is a learnable skill; the feedback should reinforce that belief.

---

# Output Requirement

Return your assessment as a bilingual JSON object structured as specified in the user prompt. All feedback prose must be professional, specific, and encouraging in register. Vietnamese translations should be natural and idiomatic, not literal renderings of the English.`;

// ─── Build scoring prompt (Bilingual JSON) ──────────────────────────────────
function buildUserPrompt(data: WizardData, wordCount: number): string {
  const taskNumber = data.taskNumber;
  const taskType =
    taskNumber === "1"
      ? data.taskType === "academic"
        ? "Academic Task 1"
        : "General Training Task 1"
      : "Task 2";

  return `TASK TYPE: IELTS Writing ${taskNumber} (${taskType})
TASK PROMPT: ${data.question}
WORD COUNT: ${wordCount}

ESSAY:
${data.essay}

---

Score this essay according to the SYSTEM_PROMPT. Return your response as valid JSON ONLY.

Required JSON structure (Bilingual):
{
  "task_achievement_band": <number>,
  "coherence_cohesion_band": <number>,
  "lexical_resource_band": <number>,
  "grammatical_range_accuracy_band": <number>,
  "overall_band": <number>,
  "feedback": {
    "task_achievement":           { 
        "strengths": "<EN>", "improvements": "<EN>", "band_justification": "<EN>",
        "strengths_vi": "<VI>", "improvements_vi": "<VI>", "band_justification_vi": "<VI>" 
    },
    "coherence_cohesion":         { 
        "strengths": "<EN>", "improvements": "<EN>", "band_justification": "<EN>",
        "strengths_vi": "<VI>", "improvements_vi": "<VI>", "band_justification_vi": "<VI>" 
    },
    "lexical_resource":           { 
        "strengths": "<EN>", "improvements": "<EN>", "band_justification": "<EN>",
        "strengths_vi": "<VI>", "improvements_vi": "<VI>", "band_justification_vi": "<VI>" 
    },
    "grammatical_range_accuracy": { 
        "strengths": "<EN>", "improvements": "<EN>", "band_justification": "<EN>",
        "strengths_vi": "<VI>", "improvements_vi": "<VI>", "band_justification_vi": "<VI>" 
    },
    "priority_actions": ["<EN action 1>", "<EN action 2>"],
    "priority_actions_vi": ["<VI action 1>", "<VI action 2>"],
    "overall_comment": "<EN summary>",
    "overall_comment_vi": "<VI summary>"
  }
}

Use the rigour and diagnostic rules from the system prompt. For all *_vi fields, provide natural, high-quality, FULL translations of the English text into Vietnamese. Translate everything, including any IELTS band descriptors or sentences you quote. DO NOT leave entire English sentences untranslated in the Vietnamese fields.`;
}



// ─── Validate AI response ─────────────────────────────────────────────────────
const VALID_BANDS = new Set([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]);

function validateAIResponse(raw: unknown): raw is AIRawResponse {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  const bandFields = [
    "task_achievement_band",
    "coherence_cohesion_band",
    "lexical_resource_band",
    "grammatical_range_accuracy_band",
    "overall_band",
  ] as const;
  for (const f of bandFields) {
    if (typeof r[f] !== "number" || !VALID_BANDS.has(r[f] as number)) return false;
  }
  const fb = r.feedback as Record<string, unknown> | undefined;
  if (!fb || typeof fb !== "object") return false;
  const criterionKeys = ["task_achievement", "coherence_cohesion", "lexical_resource", "grammatical_range_accuracy"];
  for (const k of criterionKeys) {
    const c = fb[k] as Record<string, unknown> | undefined;
    if (!c || typeof c.strengths !== "string" || typeof c.improvements !== "string") return false;
  }
  if (!Array.isArray(fb.priority_actions) || typeof fb.overall_comment !== "string") return false;
  return true;
}

// ─── Transform AI response → AnalysisResult ──────────────────────────────────
function aiToAnalysisResult(
  ai: AIRawResponse,
  data: WizardData,
  wordCount: number
): AnalysisResult {
  const taskNumber = data.taskNumber;
  const taskType = data.taskType;
  const taLabel = taskNumber === "1" ? "Task Achievement" : "Task Response";

  function makeCriterion(
    criterion: "ta" | "cc" | "lr" | "gra",
    band: number,
    label: string,
    rawEn: { strengths: string; improvements: string; band_justification: string },
    rawVi?: { strengths: string; improvements: string; band_justification: string }
  ): CriterionFeedback {
    return {
      score: band,
      label,
      wellDone: rawEn.strengths,
      improvement: rawEn.improvements,
      descriptorCurrent: getDescriptor(criterion, Math.floor(band), taskType, taskNumber),
      descriptorNext: getNextDescriptor(criterion, band, taskType, taskNumber),
      bandJustification: rawEn.band_justification,
      wellDone_vi: rawVi?.strengths,
      improvement_vi: rawVi?.improvements,
      bandJustification_vi: rawVi?.band_justification,
    };
  }

  const bands = {
    ta: ai.task_achievement_band,
    cc: ai.coherence_cohesion_band,
    lr: ai.lexical_resource_band,
    gra: ai.grammatical_range_accuracy_band,
    overall: roundToHalfBand(
      (ai.task_achievement_band + ai.coherence_cohesion_band + ai.lexical_resource_band + ai.grammatical_range_accuracy_band) / 4
    ),
  };

  const fb = ai.feedback;

  return {
    bands,
    feedback: {
      ta: makeCriterion("ta", bands.ta, taLabel, fb.task_achievement, {
        strengths: fb.task_achievement.strengths_vi || "",
        improvements: fb.task_achievement.improvements_vi || "",
        band_justification: fb.task_achievement.band_justification_vi || ""
      }),
      cc: makeCriterion("cc", bands.cc, "Coherence & Cohesion", fb.coherence_cohesion, {
        strengths: fb.coherence_cohesion.strengths_vi || "",
        improvements: fb.coherence_cohesion.improvements_vi || "",
        band_justification: fb.coherence_cohesion.band_justification_vi || ""
      }),
      lr: makeCriterion("lr", bands.lr, "Lexical Resource", fb.lexical_resource, {
        strengths: fb.lexical_resource.strengths_vi || "",
        improvements: fb.lexical_resource.improvements_vi || "",
        band_justification: fb.lexical_resource.band_justification_vi || ""
      }),
      gra: makeCriterion("gra", bands.gra, "Grammatical Range & Accuracy", fb.grammatical_range_accuracy, {
        strengths: fb.grammatical_range_accuracy.strengths_vi || "",
        improvements: fb.grammatical_range_accuracy.improvements_vi || "",
        band_justification: fb.grammatical_range_accuracy.band_justification_vi || ""
      }),
    },
    tips: fb.priority_actions || [],
    tips_vi: fb.priority_actions_vi || fb.priority_actions || [],
    wordCount,
    disclaimer: "⚠️ Assessed by AI Examiner (Claude 3.5 Sonnet) — not an official IELTS result.",
    scoring_method: "ai_examiner",
    overallComment: fb.overall_comment,
    overallComment_vi: fb.overall_comment_vi,
    priorityActions: fb.priority_actions || [],
    priorityActions_vi: fb.priority_actions_vi || fb.priority_actions || [],
  };
}

// ─── Persist to Supabase ──────────────────────────────────────────────────────
// Builds a comprehensive feedback_json that includes all VI translations
// so that the submission detail page can fully reconstruct the bilingual feedback.
async function persistToSupabase(
  data: WizardData,
  result: AnalysisResult,
  rawFeedback: AIRawFeedback | Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServiceClient();
    const taskType = data.taskNumber === "1" ? "task1" : "task2";

    const { data: submission, error: subErr } = await supabase
      .from("essay_submissions")
      .insert({
        user_id: data.user_id || null,
        task_type: taskType,
        prompt_text: data.question || "",
        essay_text: data.essay,
        word_count: result.wordCount,
        language: data.language || "en",
        scoring_method: result.scoring_method || "rule_based_fallback",
        question_id: data.question_id || null,
      })
      .select("id")
      .single();

    if (subErr || !submission) {
      console.error("Supabase submission insert error:", subErr?.message);
      return;
    }

    // Build an enriched feedback_json that includes VI translations merged from result
    // This ensures the submission detail page can show bilingual content.
    const enrichedFeedbackJson = {
      ...rawFeedback,
      // Merge VI translations that were added after the primary AI call
      task_achievement_vi: result.feedback.ta.wellDone_vi
        ? { strengths: result.feedback.ta.wellDone_vi, improvements: result.feedback.ta.improvement_vi, band_justification: result.feedback.ta.bandJustification_vi }
        : undefined,
      coherence_cohesion_vi: result.feedback.cc.wellDone_vi
        ? { strengths: result.feedback.cc.wellDone_vi, improvements: result.feedback.cc.improvement_vi, band_justification: result.feedback.cc.bandJustification_vi }
        : undefined,
      lexical_resource_vi: result.feedback.lr.wellDone_vi
        ? { strengths: result.feedback.lr.wellDone_vi, improvements: result.feedback.lr.improvement_vi, band_justification: result.feedback.lr.bandJustification_vi }
        : undefined,
      grammatical_range_accuracy_vi: result.feedback.gra.wellDone_vi
        ? { strengths: result.feedback.gra.wellDone_vi, improvements: result.feedback.gra.improvement_vi, band_justification: result.feedback.gra.bandJustification_vi }
        : undefined,
      overall_comment_vi: result.overallComment_vi,
      priority_actions_vi: result.priorityActions_vi,
      // Store full AnalysisResult so the detail page can reconstruct the UI exactly
      _full_result: result,
    };

    const { error: fbErr } = await supabase.from("feedback_results").insert({
      submission_id: submission.id,
      overall_band: result.bands.overall,
      task_achievement_band: result.bands.ta,
      coherence_cohesion_band: result.bands.cc,
      lexical_resource_band: result.bands.lr,
      grammatical_range_accuracy_band: result.bands.gra,
      feedback_json: enrichedFeedbackJson,
    });

    if (fbErr) console.error("Supabase feedback insert error:", fbErr.message);
  } catch (err) {
    console.error("Supabase persist error:", err);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Subscribe-only action (legacy — keep intact)
    if (body._action === "subscribe") {
      await appendToSheet({
        name: body.name || "",
        age: "",
        address: "",
        mobile: body.mobile || "",
        email: body.email || "",
        currentBandL: "",
        currentBandR: "",
        currentBandW: "",
        currentBandS: "",
        targetBand: "",
        taskType: "",
        taskNumber: "",
        question: "SUBSCRIBE_ONLY",
        wordCount: 0,
        bandTA: "",
        bandCC: "",
        bandLR: "",
        bandGRA: "",
        bandOverall: "",
        feedback: {},
        subscribed: true,
      });
      return NextResponse.json({ success: true });
    }

    // Main analysis
    const data = body as WizardData;

    if (!data.essay || !data.taskType || !data.taskNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const words = data.essay.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // ── 1. Attempt Anthropic AI scoring ──────────────────────────────────────
    let result: AnalysisResult | null = null;
    let rawAIFeedback: AIRawFeedback | null = null;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey });
        // buildUserPrompt should now generate a prompt that requests both EN and VI feedback
        // and incorporates high-rigour scoring rules.
        const userPrompt = buildUserPrompt(data, wordCount);

        // The SYSTEM_PROMPT should also be updated to reflect the high-rigour scoring rules
        // and the expectation of bilingual output.
        const aiPromise = client.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096, // Increased max_tokens to accommodate bilingual output
          messages: [{ role: "user", content: userPrompt }],
          system: SYSTEM_PROMPT, // SYSTEM_PROMPT is assumed to be updated elsewhere
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Anthropic API timeout")), TIMEOUT_MS)
        );

        const message = await Promise.race([aiPromise, timeoutPromise]);
        const content = message.content[0];
        if (content.type !== "text") throw new Error("Unexpected content type from Anthropic");

        // Strip markdown fences if present (```json ... ``` or ``` ... ```)
        const jsonText = content.text.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
        const parsed: unknown = JSON.parse(jsonText);

        if (!validateAIResponse(parsed)) {
          throw new Error("AI response failed validation — falling back to rule-based");
        }

        rawAIFeedback = parsed.feedback;
        // aiToAnalysisResult should now be capable of extracting both EN and VI feedback
        // from the single 'parsed' object.
        result = aiToAnalysisResult(parsed, data, wordCount);

        console.log(`[analyze] scoring_method=ai_examiner | vi=${!!result.overallComment_vi}`);
      } catch (aiErr: any) {
        console.error("[analyze] Anthropic API failed:", aiErr.message);
        // Include partial details if it's a validation error
        if (aiErr.message.includes("validation")) {
          console.error("[analyze] Validation error details - ensure prompt and schema match.");
        }
      }
    } else {
      console.warn("[analyze] ANTHROPIC_API_KEY is missing. Falling back to rule-based.");
    }

    // ── 2. Fallback to rule-based engine ─────────────────────────────────────
    if (!result) {
      result = analyzeEssay(data);
      result.scoring_method = "rule_based_fallback";
      console.log("[analyze] scoring_method=rule_based_fallback");
    }

    // ── 3. Persist to Supabase and Sheets (await to prevent serverless cancellation) ──
    const feedbackToStore: AIRawFeedback | Record<string, unknown> =
      rawAIFeedback ?? (result.feedback as unknown as Record<string, unknown>);

    await Promise.allSettled([
      persistToSupabase(data, result, feedbackToStore),
      appendToSheet({
        name: data.name || "",
        age: data.age || "",
        address: data.address || "",
        mobile: data.mobile || "",
        email: data.email || "",
        currentBandL: data.currentBands?.listening || "",
        currentBandR: data.currentBands?.reading || "",
        currentBandW: data.currentBands?.writing || "",
        currentBandS: data.currentBands?.speaking || "",
        targetBand: data.targetBand || "",
        taskType: data.taskType,
        taskNumber: data.taskNumber,
        question: data.question || "",
        wordCount: result.wordCount,
        bandTA: result.bands.ta,
        bandCC: result.bands.cc,
        bandLR: result.bands.lr,
        bandGRA: result.bands.gra,
        bandOverall: result.bands.overall,
        feedback: result.feedback,
        subscribed: false,
      })
    ]);

    return NextResponse.json({
      success: true,
      result,
      scoring_method: result.scoring_method,
    });
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
