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
  CriterionFeedback,
} from "@/types";

export const runtime = "nodejs";
const TIMEOUT_MS = 15_000;

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

// ─── Build user prompt ────────────────────────────────────────────────────────
function buildUserPrompt(data: WizardData, wordCount: number): string {
  const taskNumber = data.taskNumber;
  const taskType =
    taskNumber === "1"
      ? data.taskType === "academic"
        ? "Academic Task 1"
        : "General Training Task 1"
      : "Task 2";
  const language = data.language || "en";

  return `TASK TYPE: IELTS Writing ${taskNumber} (${taskType})
TASK PROMPT: ${data.question}
WORD COUNT: ${wordCount}
RESPONSE LANGUAGE FOR FEEDBACK: ${language}

ESSAY:
${data.essay}

---

Score this essay on all four IELTS criteria. Return your response as a JSON object only, with no preamble or explanation outside the JSON.

Required JSON structure:
{
  "task_achievement_band": <number>,
  "coherence_cohesion_band": <number>,
  "lexical_resource_band": <number>,
  "grammatical_range_accuracy_band": <number>,
  "overall_band": <number>,
  "feedback": {
    "task_achievement": {
      "strengths": "<2–3 sentences in ${language}, IELTS terms in English>",
      "improvements": "<2–3 sentences in ${language}, IELTS terms in English>",
      "band_justification": "<1 sentence in ${language} explaining the band awarded>"
    },
    "coherence_cohesion": {
      "strengths": "<...>",
      "improvements": "<...>",
      "band_justification": "<...>"
    },
    "lexical_resource": {
      "strengths": "<...>",
      "improvements": "<...>",
      "band_justification": "<...>"
    },
    "grammatical_range_accuracy": {
      "strengths": "<...>",
      "improvements": "<...>",
      "band_justification": "<...>"
    },
    "priority_actions": ["<action 1 in ${language}>", "<action 2 in ${language}>", "<action 3 in ${language}>"],
    "overall_comment": "<2–3 sentence summary in ${language}>"
  }
}

Language instruction: Write ALL feedback prose in ${language === "vi" ? "Vietnamese (Tiếng Việt)" : "English"}.
${language === "vi" ? `Vietnamese rules (apply strictly):
- Write strengths, improvements, band_justification, priority_actions, and overall_comment entirely in Vietnamese.
- Retain these terms in English regardless: Task Achievement, Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy, Task 1, Task 2, Academic, General Training, Band (and all band numbers), and any specific grammar or vocabulary labels you cite.
- Do NOT translate IELTS criterion names or band descriptors into Vietnamese.
- Maintain a formal, encouraging academic register appropriate for a Vietnamese student preparing for IELTS.` : `English rules: Write all feedback in formal academic English.`}`;
}

// ─── Validate AI response ─────────────────────────────────────────────────────
const VALID_BANDS = new Set([1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9]);

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
  const criterionKeys = ["task_achievement","coherence_cohesion","lexical_resource","grammatical_range_accuracy"];
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
    raw: { strengths: string; improvements: string; band_justification: string }
  ): CriterionFeedback {
    return {
      score: band,
      label,
      wellDone: raw.strengths,
      improvement: raw.improvements,
      descriptorCurrent: getDescriptor(criterion, Math.floor(band), taskType, taskNumber),
      descriptorNext: getNextDescriptor(criterion, band, taskType, taskNumber),
      bandJustification: raw.band_justification,
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

  return {
    bands,
    feedback: {
      ta:  makeCriterion("ta",  bands.ta,  taLabel, ai.feedback.task_achievement),
      cc:  makeCriterion("cc",  bands.cc,  "Coherence & Cohesion", ai.feedback.coherence_cohesion),
      lr:  makeCriterion("lr",  bands.lr,  "Lexical Resource", ai.feedback.lexical_resource),
      gra: makeCriterion("gra", bands.gra, "Grammatical Range & Accuracy", ai.feedback.grammatical_range_accuracy),
    },
    tips: ai.feedback.priority_actions,
    wordCount,
    disclaimer: "⚠️ Assessed by AI Examiner (claude-sonnet-4-20250514) — not an official IELTS result.",
    scoring_method: "ai_examiner",
    overallComment: ai.feedback.overall_comment,
    priorityActions: ai.feedback.priority_actions,
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

        // Strip markdown fences if present
        const jsonText = content.text.replace(/^```json\s*|```\s*$/g, "").trim();
        const parsed: unknown = JSON.parse(jsonText);

        if (!validateAIResponse(parsed)) {
          throw new Error("AI response failed validation — falling back to rule-based");
        }

        rawAIFeedback = parsed.feedback;
        result = aiToAnalysisResult(parsed, data, wordCount);
        console.log("[analyze] scoring_method=ai_examiner");
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
