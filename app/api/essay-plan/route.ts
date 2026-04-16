import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { EssayPlanRequest, EssayPlanResponse } from "@/types";

export const runtime = "nodejs";
const TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `You are an expert IELTS Writing tutor. Your job is to produce a clear, structured essay plan that a student can use as a guide before writing their response.

The plan must be practical and concise — not an essay itself. It should include:
- A suggested thesis / main argument (for Task 2) or overview statement (for Task 1)
- A paragraph-by-paragraph outline with key ideas and supporting points
- Suggested cohesive devices or transitions to use between paragraphs
- A brief note on vocabulary range to aim for

Keep the plan to approximately 200–300 words. Use numbered paragraphs and bullet points.`;

function buildPlanPrompt(req: EssayPlanRequest): string {
  const taskLabel =
    req.task_number === "1"
      ? req.task_type === "academic"
        ? "IELTS Academic Task 1"
        : "IELTS General Training Task 1"
      : "IELTS Writing Task 2";

  const langInstruction =
    req.language === "vi"
      ? `Write the essay plan entirely in Vietnamese (Tiếng Việt). Retain all IELTS terms in English (e.g. Task 1, Task 2, Band, Coherence, Lexical Resource, etc.).`
      : `Write the essay plan in formal academic English.`;

  return `TASK TYPE: ${taskLabel}
TASK PROMPT: ${req.prompt_text}

${langInstruction}

Produce a structured essay plan for a student who is about to write their response. Do NOT write the essay itself.`;
}

export async function POST(req: NextRequest): Promise<NextResponse<EssayPlanResponse | { success: boolean; error: string }>> {
  try {
    const body = (await req.json()) as EssayPlanRequest;

    if (!body.task_type || !body.task_number || !body.prompt_text) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "AI unavailable" }, { status: 503 });
    }

    const client = new Anthropic({ apiKey });
    const planPromise = client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPlanPrompt(body) }],
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS)
    );

    const message = await Promise.race([planPromise, timeoutPromise]);
    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected content type");

    return NextResponse.json({ success: true, plan: content.text.trim() });
  } catch (err) {
    console.error("[essay-plan] error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to generate plan" },
      { status: 500 }
    );
  }
}
