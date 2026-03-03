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
const SYSTEM_PROMPT = `You are an expert IELTS examiner with over 15 years of experience assessing Academic and General Training Writing tasks. You assess essays strictly according to the official IELTS Writing Band Descriptors published by Cambridge Assessment English.

You must score all four criteria independently and objectively:
- Task Achievement (Task 1) / Task Response (Task 2)
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

Scoring rules:
- All band scores must be on the official IELTS scale: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9
- The overall band is the mean of all four criteria, rounded to the nearest 0.5
- Do not inflate scores. A Band 6 essay has clear but imprecise vocabulary and some grammatical errors. A Band 7 essay demonstrates flexibility and precision with only occasional errors.
- Assess what is actually written, not what the student intended

Critical scoring anchors to apply strictly:
- Task Achievement/Response below Band 6: task only partially addressed, key features missing or misrepresented, position unclear
- Coherence and Cohesion Band 5: cohesive devices used but mechanically or repetitively, without adequate progression
- Lexical Resource Band 6: adequate range, some errors in word choice/collocation, some paraphrase attempted
- Grammatical Range and Accuracy Band 6: mix of simple and complex structures, some errors but meaning remains clear

You must never award Band 7+ to an essay with frequent grammatical errors, imprecise vocabulary, or inadequate task coverage.`;

// ─── Build scoring prompt (English output only) ─────────────────────────────────
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

Score this essay on all four IELTS criteria. Return your response as valid JSON only, with no preamble or explanation outside the JSON.

Required JSON structure:
{
  "task_achievement_band": <number>,
  "coherence_cohesion_band": <number>,
  "lexical_resource_band": <number>,
  "grammatical_range_accuracy_band": <number>,
  "overall_band": <number>,
  "feedback": {
    "task_achievement":           { "strengths": "<2–3 sentences in English>", "improvements": "<2–3 sentences in English>", "band_justification": "<1 sentence in English>" },
    "coherence_cohesion":         { "strengths": "<...>", "improvements": "<...>", "band_justification": "<...>" },
    "lexical_resource":           { "strengths": "<...>", "improvements": "<...>", "band_justification": "<...>" },
    "grammatical_range_accuracy": { "strengths": "<...>", "improvements": "<...>", "band_justification": "<...>" },
    "priority_actions": ["<action 1>", "<action 2>", "<action 3>"],
    "overall_comment": "<2–3 sentence summary>"
  }
}

Write all feedback prose in formal academic English.`;
}

// ─── Build translation prompt (VI output from EN feedback JSON) ──────────────────
type EnFeedbackOnly = {
  task_achievement: AIRawCriterionFeedback;
  coherence_cohesion: AIRawCriterionFeedback;
  lexical_resource: AIRawCriterionFeedback;
  grammatical_range_accuracy: AIRawCriterionFeedback;
  priority_actions: string[];
  overall_comment: string;
};

function buildTranslatePrompt(enFeedback: EnFeedbackOnly): string {
  return `You are a professional translator specialising in IELTS education materials.

Translate the following IELTS examiner feedback from English into Vietnamese (Tiếng Việt).

IMPORTANT rules:
- Translate naturally and fluently — do NOT translate field names, only their string values.
- Keep these terms in English: Task Achievement, Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy, Band (with numbers), Academic, General Training, IELTS.
- Return ONLY a valid JSON object, no markdown, no explanation.

Input JSON to translate:
${JSON.stringify(enFeedback, null, 2)}

Return the translated content using EXACTLY this JSON structure:
{
  "task_achievement":           { "strengths": "<VI>", "improvements": "<VI>", "band_justification": "<VI>" },
  "coherence_cohesion":         { "strengths": "<VI>", "improvements": "<VI>", "band_justification": "<VI>" },
  "lexical_resource":           { "strengths": "<VI>", "improvements": "<VI>", "band_justification": "<VI>" },
  "grammatical_range_accuracy": { "strengths": "<VI>", "improvements": "<VI>", "band_justification": "<VI>" },
  "priority_actions": ["<VI>", "<VI>", "<VI>"],
  "overall_comment": "<VI>"
}`;
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
    if (!c || typeof c.strengths !== "string" || typeof c.improvements !== "string" || typeof c.band_justification !== "string") return false;
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
      ta: makeCriterion("ta", bands.ta, taLabel, fb.task_achievement, fb.task_achievement_vi),
      cc: makeCriterion("cc", bands.cc, "Coherence & Cohesion", fb.coherence_cohesion, fb.coherence_cohesion_vi),
      lr: makeCriterion("lr", bands.lr, "Lexical Resource", fb.lexical_resource, fb.lexical_resource_vi),
      gra: makeCriterion("gra", bands.gra, "Grammatical Range & Accuracy", fb.grammatical_range_accuracy, fb.grammatical_range_accuracy_vi),
    },
    tips: fb.priority_actions,
    tips_vi: fb.priority_actions_vi,
    wordCount,
    disclaimer: "⚠️ Assessed by AI Examiner (claude-sonnet-4-20250514) — not an official IELTS result.",
    scoring_method: "ai_examiner",
    overallComment: fb.overall_comment,
    overallComment_vi: fb.overall_comment_vi,
    priorityActions: fb.priority_actions,
    priorityActions_vi: fb.priority_actions_vi,
  };
}

// ─── Persist to Supabase ──────────────────────────────────────────────────────
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
        task_type: taskType,
        prompt_text: data.question || "",
        essay_text: data.essay,
        word_count: result.wordCount,
        language: data.language || "en",
        scoring_method: result.scoring_method || "rule_based_fallback",
      })
      .select("id")
      .single();

    if (subErr || !submission) {
      console.error("Supabase submission insert error:", subErr?.message);
      return;
    }

    const { error: fbErr } = await supabase.from("feedback_results").insert({
      submission_id: submission.id,
      overall_band: result.bands.overall,
      task_achievement_band: result.bands.ta,
      coherence_cohesion_band: result.bands.cc,
      lexical_resource_band: result.bands.lr,
      grammatical_range_accuracy_band: result.bands.gra,
      feedback_json: rawFeedback,
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
        const userPrompt = buildUserPrompt(data, wordCount);

        // ── 1a. Primary scoring call (EN only, fast) ───────────────────────
        const aiPromise = client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: userPrompt }],
          system: SYSTEM_PROMPT,
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
        result = aiToAnalysisResult(parsed, data, wordCount);

        // ── 1b. Parallel translation call (VI, non-blocking on failure) ────
        const enFeedbackForTranslation: EnFeedbackOnly = {
          task_achievement: parsed.feedback.task_achievement,
          coherence_cohesion: parsed.feedback.coherence_cohesion,
          lexical_resource: parsed.feedback.lexical_resource,
          grammatical_range_accuracy: parsed.feedback.grammatical_range_accuracy,
          priority_actions: parsed.feedback.priority_actions,
          overall_comment: parsed.feedback.overall_comment,
        };
        const translatePrompt = buildTranslatePrompt(enFeedbackForTranslation);

        const translateCall = client.messages.create({
          model: "claude-haiku-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: translatePrompt }],
        });
        const translateTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Translation timeout")), TIMEOUT_MS)
        );

        const [translateOutcome] = await Promise.allSettled([
          Promise.race([translateCall, translateTimeout]),
        ]);

        if (translateOutcome.status === "fulfilled") {
          const tContent = translateOutcome.value.content[0];
          if (tContent.type === "text") {
            try {
              const tJson = tContent.text.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
              const viData = JSON.parse(tJson) as EnFeedbackOnly;
              // Merge VI fields into result
              result.feedback.ta.wellDone_vi = viData.task_achievement?.strengths;
              result.feedback.ta.improvement_vi = viData.task_achievement?.improvements;
              result.feedback.ta.bandJustification_vi = viData.task_achievement?.band_justification;
              result.feedback.cc.wellDone_vi = viData.coherence_cohesion?.strengths;
              result.feedback.cc.improvement_vi = viData.coherence_cohesion?.improvements;
              result.feedback.cc.bandJustification_vi = viData.coherence_cohesion?.band_justification;
              result.feedback.lr.wellDone_vi = viData.lexical_resource?.strengths;
              result.feedback.lr.improvement_vi = viData.lexical_resource?.improvements;
              result.feedback.lr.bandJustification_vi = viData.lexical_resource?.band_justification;
              result.feedback.gra.wellDone_vi = viData.grammatical_range_accuracy?.strengths;
              result.feedback.gra.improvement_vi = viData.grammatical_range_accuracy?.improvements;
              result.feedback.gra.bandJustification_vi = viData.grammatical_range_accuracy?.band_justification;
              result.overallComment_vi = viData.overall_comment;
              result.priorityActions_vi = viData.priority_actions;
              result.tips_vi = viData.priority_actions;
              console.log("[analyze] translation=ok");
            } catch (parseErr) {
              console.warn("[analyze] Translation JSON parse failed:", parseErr);
            }
          }
        } else {
          console.warn("[analyze] Translation failed:", translateOutcome.reason);
        }

        console.log(`[analyze] scoring_method=ai_examiner | vi=${!!result.overallComment_vi}`);
      } catch (aiErr) {
        console.error("[analyze] Anthropic API failed, falling back:", aiErr instanceof Error ? aiErr.message : aiErr);
      }
    }

    // ── 2. Fallback to rule-based engine ─────────────────────────────────────
    if (!result) {
      result = analyzeEssay(data);
      result.scoring_method = "rule_based_fallback";
      console.log("[analyze] scoring_method=rule_based_fallback");
    }

    // ── 3. Persist to Supabase (non-blocking) ─────────────────────────────────
    const feedbackToStore: AIRawFeedback | Record<string, unknown> =
      rawAIFeedback ?? (result.feedback as unknown as Record<string, unknown>);
    persistToSupabase(data, result, feedbackToStore).catch(console.error);

    // ── 4. Persist to Google Sheets (non-blocking, legacy) ────────────────────
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
    }).catch(console.error);

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
