import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SCORING_SYSTEM = `You are a senior IELTS examiner certified to assess Writing Task 1 responses. 
You receive a confirmed visual description and a candidate essay. Score against the 
four official IELTS Writing band descriptors. Return JSON ONLY — no markdown fences:
{
  "band_scores": {
    "task_achievement": number,
    "coherence_cohesion": number,
    "lexical_resource": number,
    "grammatical_range_accuracy": number,
    "overall": number
  },
  "feedback": {
    "task_achievement": {
      "strengths": ["array"],
      "weaknesses": ["array"],
      "missed_key_features": ["array — data or trends the essay omitted or misreported"]
    },
    "coherence_cohesion": { "strengths": ["array"], "weaknesses": ["array"] },
    "lexical_resource": {
      "strengths": ["array"],
      "weaknesses": ["array"],
      "suggestions": ["array — specific vocabulary upgrades with examples"]
    },
    "grammatical_range_accuracy": {
      "strengths": ["array"],
      "errors": ["array — quote the error then provide correction"],
      "range_comment": "string"
    }
  },
  "improved_sample": "string — a model overview paragraph demonstrating Band 7.5+ writing for this visual",
  "examiner_summary": "string — 3-4 sentence holistic examiner comment"
}
Half-bands permitted (e.g. 6.5). Overall = mean of four criteria rounded to nearest 0.5.
Be rigorous: do not inflate. Band 6 TA has gaps; Band 7 covers key features with overview; 
Band 8 is fully representative with well-selected detail.`;

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse and validate body
        const { essay, chartData, submissionId, imagePath } = await req.json();

        if (!essay || !chartData) {
            return NextResponse.json({ error: "Missing essay or chart data" }, { status: 400 });
        }

        if (essay.length < 50) {
            return NextResponse.json({ error: "Essay must be at least 50 characters" }, { status: 400 });
        }

        // 3. Call Anthropic API
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service configuration missing" }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey });
        const userMessage = `CONFIRMED VISUAL DESCRIPTION:\n${JSON.stringify(chartData)}\n\nCANDIDATE ESSAY:\n${essay}`;

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            system: SCORING_SYSTEM,
            messages: [
                { role: "user", content: userMessage }
            ],
        });

        const content = message.content[0];
        if (content.type !== "text") {
            throw new Error("Unexpected response type from AI");
        }

        const jsonMatch = content.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const result = JSON.parse(jsonMatch);

        // 4. Persistence
        const serviceClient = createServiceClient();
        let currentSubmissionId = submissionId;

        if (!currentSubmissionId) {
            // Auto-create a submission record for Task 1
            const { data: newSub, error: createError } = await serviceClient
                .from("essay_submissions")
                .insert({
                    user_id: user.id,
                    task_type: "task1",
                    prompt_text: (chartData.title || "IELTS Writing Task 1").slice(0, 512),
                    essay_text: essay,
                    image_path: imagePath || null,
                    chart_data: chartData,
                    word_count: essay.trim().split(/\s+/).length,
                    scoring_method: "ai_examiner"
                })
                .select("id")
                .single();

            if (createError) {
                console.error("Task 1 Submission direct creation error:", createError);
            } else {
                currentSubmissionId = newSub.id;
            }
        } else {
            // Update existing (unlikely in current flow but kept for safety)
            const { error: updateError } = await serviceClient
                .from("essay_submissions")
                .update({
                    chart_data: chartData,
                    essay_text: essay,
                    word_count: essay.trim().split(/\s+/).length
                })
                .eq("id", currentSubmissionId);

            if (updateError) {
                console.error("Submission update error:", updateError);
            }
        }

        if (currentSubmissionId) {
            // Store the score result in feedback_results
            const { error: fbError } = await serviceClient
                .from("feedback_results")
                .insert({
                    submission_id: currentSubmissionId,
                    overall_band: result.band_scores.overall,
                    task_achievement_band: result.band_scores.task_achievement,
                    coherence_cohesion_band: result.band_scores.coherence_cohesion,
                    lexical_resource_band: result.band_scores.lexical_resource,
                    grammatical_range_accuracy_band: result.band_scores.grammatical_range_accuracy,
                    feedback_json: {
                        feedback: result.feedback,
                        improved_sample: result.improved_sample,
                        examiner_summary: result.examiner_summary,
                        bands: result.band_scores
                    }
                });

            if (fbError) {
                console.error("Feedback insert error:", fbError);
            }

            // Include ID in response
            result.submissionId = currentSubmissionId;
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Task 1 scoring error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
