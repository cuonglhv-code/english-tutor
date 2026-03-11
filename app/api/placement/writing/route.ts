import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
const TIMEOUT_MS = 40_000;

// ─── Same system prompt as /api/analyze but simplified for placement ──────────
const SYSTEM_PROMPT = `You are an expert Senior IELTS Examiner with over 15 years of experience assessing Writing tasks.

Your objective: Score the essay strictly according to official IELTS Writing Band Descriptors (Updated May 2023) and provide bilingual (English + Vietnamese) feedback.

Assessment rules:
1. Full Fit Rule: A script must fully fit the positive features of the descriptor at a band to receive it.
2. Limiter Rule: Negative features at Band 5/6 prevent scoring 7+ in that criterion.
3. Scoring Scale: All bands on the official IELTS scale (1.0–9.0 in 0.5 increments). Overall = mean of four criteria rounded to nearest 0.5.
4. Objective Reality: Assess what is written, not what was intended.

You MUST return ONLY a valid JSON object — no markdown, no commentary, no extra text.`;

function buildPrompt(essay: string, promptText: string, wordCount: number): string {
  return `TASK TYPE: IELTS Writing Task 1 (Academic)
TASK PROMPT: ${promptText}
WORD COUNT: ${wordCount}

ESSAY:
${essay}

---
Score this essay and return ONLY valid JSON with this exact structure:
{
  "task_achievement_band": <number 1-9 in 0.5 steps>,
  "coherence_cohesion_band": <number>,
  "lexical_resource_band": <number>,
  "grammatical_range_accuracy_band": <number>,
  "overall_band": <number>,
  "feedback": {
    "task_achievement": {
      "strengths": "<EN text>",
      "improvements": "<EN text>",
      "band_justification": "<EN text>",
      "strengths_vi": "<VI text>",
      "improvements_vi": "<VI text>",
      "band_justification_vi": "<VI text>"
    },
    "coherence_cohesion": {
      "strengths": "<EN text>",
      "improvements": "<EN text>",
      "band_justification": "<EN text>",
      "strengths_vi": "<VI text>",
      "improvements_vi": "<VI text>",
      "band_justification_vi": "<VI text>"
    },
    "lexical_resource": {
      "strengths": "<EN text>",
      "improvements": "<EN text>",
      "band_justification": "<EN text>",
      "strengths_vi": "<VI text>",
      "improvements_vi": "<VI text>",
      "band_justification_vi": "<VI text>"
    },
    "grammatical_range_accuracy": {
      "strengths": "<EN text>",
      "improvements": "<EN text>",
      "band_justification": "<EN text>",
      "strengths_vi": "<VI text>",
      "improvements_vi": "<VI text>",
      "band_justification_vi": "<VI text>"
    },
    "priority_actions": ["<EN action 1>", "<EN action 2>", "<EN action 3>"],
    "priority_actions_vi": ["<VI action 1>", "<VI action 2>", "<VI action 3>"],
    "overall_comment": "<EN paragraph>",
    "overall_comment_vi": "<VI paragraph>"
  }
}`;
}

const VALID_BANDS = new Set([
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5,
  6, 6.5, 7, 7.5, 8, 8.5, 9,
]);

function validateBand(v: unknown): number {
  const n = Number(v);
  if (VALID_BANDS.has(n)) return n;
  // Round to nearest 0.5 and clamp
  const rounded = Math.round(n * 2) / 2;
  return Math.max(1, Math.min(9, rounded));
}

export interface PlacementWritingResult {
  task_achievement_band: number;
  coherence_cohesion_band: number;
  lexical_resource_band: number;
  grammatical_range_accuracy_band: number;
  overall_band: number;
  feedback_json: Record<string, unknown>;
  word_count: number;
}

/**
 * POST /api/placement/writing
 * Body: { essay: string, promptText: string }
 * Returns: PlacementWritingResult
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { essay, promptText } = body as {
    essay: string;
    promptText: string;
  };

  if (!essay || !promptText) {
    return NextResponse.json(
      { error: "essay and promptText are required" },
      { status: 400 }
    );
  }

  const wordCount =
    essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const client = new Anthropic({ apiKey });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let raw: string;
  try {
    const message = await client.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildPrompt(essay, promptText, wordCount),
          },
        ],
      },
      { signal: controller.signal }
    );
    raw =
      message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Claude request timed out" },
        { status: 504 }
      );
    }
    console.error("[placement/writing] Claude error:", err);
    return NextResponse.json(
      { error: "AI evaluation failed" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

  // ── Parse & validate ──────────────────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[placement/writing] JSON parse error:", e, "\nRaw:", raw);
    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 502 }
    );
  }

  const ta   = validateBand(parsed.task_achievement_band);
  const cc   = validateBand(parsed.coherence_cohesion_band);
  const lr   = validateBand(parsed.lexical_resource_band);
  const gra  = validateBand(parsed.grammatical_range_accuracy_band);
  const avg  = (ta + cc + lr + gra) / 4;
  const overall = Math.round(avg * 2) / 2;

  const result: PlacementWritingResult = {
    task_achievement_band: ta,
    coherence_cohesion_band: cc,
    lexical_resource_band: lr,
    grammatical_range_accuracy_band: gra,
    overall_band: overall,
    feedback_json: (parsed.feedback as Record<string, unknown>) ?? {},
    word_count: wordCount,
  };

  return NextResponse.json(result);
}
