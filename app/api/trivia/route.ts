import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, max_tokens, messages } = body ?? {};

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500 });
    }

    const response = await anthropic.messages.create({
      model: typeof model === "string" ? model : "claude-sonnet-4-20250514",
      max_tokens: typeof max_tokens === "number" ? max_tokens : 1000,
      messages: Array.isArray(messages) ? messages : [],
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[api/trivia]", err);
    return NextResponse.json(
      { error: err?.message ?? "Trivia generation failed" },
      { status: 500 }
    );
  }
}

