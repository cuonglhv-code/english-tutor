import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SCORING_SYSTEM = `You are a senior IELTS examiner assessing a Writing Task 1 response. You receive a 
confirmed visual description and a candidate essay.

Apply the official IELTS Writing Band Descriptors (Updated May 2023) using the 
Best Fit principle: award the band that most accurately reflects the student's 
demonstrated competence across the criterion as a whole. Where a script shows 
features of two adjacent bands, award the higher band when its positive features 
are clearly present, even if some lower-band features also appear. Reserve the 
lower band for scripts where limiting features are frequent and clearly dominant.

On borderline Task Achievement scripts: selective coverage of key features is 
legitimate Task 1 strategy. Penalise omissions only when they represent trends 
or comparisons central to the visual — not incidental detail. Credit overview 
attempts even when imperfectly executed, provided the communicative intent is clear.

Return JSON ONLY — no markdown fences:

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
      "strengths": ["array — specific features or trends the student identified accurately"],
      "development_gaps": ["array — key features omitted or misreported; note only those 
                           central to the visual, not peripheral detail"],
      "next_step": "string — one concrete action to strengthen Task Achievement at this 
                   student's level"
    },
    "coherence_cohesion": {
      "strengths": ["array — specific examples of effective organisation or cohesion"],
      "development_gaps": ["array — localised cohesion issues with brief explanation"],
      "next_step": "string — one concrete action to improve cohesion or progression"
    },
    "lexical_resource": {
      "strengths": ["array — vocabulary choices that demonstrate range or precision"],
      "development_gaps": ["array — imprecise, repeated, or inappropriate items"],
      "suggestions": ["array — specific upgrade examples in the format: 
                      'used: [word/phrase] → consider: [alternative] in context: [brief example]'"],
      "next_step": "string — one concrete vocabulary strategy for this student's level"
    },
    "grammatical_range_accuracy": {
      "strengths": ["array — structures used accurately or with good range"],
      "errors": ["array — format: 'Error: [quoted text] → Correction: [revised text] 
                 — Note: [brief explanation of the rule or pattern]'"],
      "range_comment": "string — assessment of structural variety; note whether complexity 
                       attempts are present even if imperfectly executed",
      "next_step": "string — one grammar focus area with highest impact for this student"
    }
  },
  "model_overview": {
    "text": "string — a model overview paragraph demonstrating strong Band 7 writing 
             for this specific visual; target the band just above the student's 
             current Task Achievement score, not an abstract ideal",
    "annotation": "string — 2–3 sentences explaining what the model paragraph does 
                  well, so the student can learn from it actively"
  },
  "examiner_summary": "string — 3–4 sentences: open with the student's most significant 
                      strength, diagnose the primary limiting factor, and close with 
                      a specific and encouraging statement about what improved 
                      performance looks like for this student"
}

Half-bands permitted (e.g. 6.5). Overall = mean of four criteria rounded to nearest 0.5.

Band threshold reference (apply with Best Fit judgement — these are guides, not 
mechanical rules):
- TA Band 6: Key features are covered but the overview may be missing or underdeveloped; 
  some data may be inaccurate or over-detailed.
- TA Band 7: Key features are clearly covered with a well-developed overview; 
  award this when coverage is substantively accurate even if minor omissions exist.
- TA Band 8: Fully representative coverage with well-selected supporting detail; 
  overview is prominent and precise.
- CC Band 6–7 threshold: Cohesive devices are present but mechanical or faulty in 
  places (Band 6); logical progression is clear throughout with only localised lapses (Band 7).
- LR Band 6–7 threshold: Vocabulary is generally adequate (Band 6); some less common 
  or precise items are attempted, even if not always successfully (Band 7).
- GRA Band 6–7 threshold: Mix of simple and complex structures with limited flexibility 
  (Band 6); complex structures are frequent and mostly accurate, with grammar generally 
  well controlled (Band 7). Do not penalise Band 7 for isolated errors within otherwise 
  well-controlled writing.`;

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request body
        // chartData  — set when student uploaded an image and confirmed extraction
        // questionId — set when student picked a question from the bank (no image)
        // imagePath  — Supabase storage path from the extract step (optional)
        // submissionId — if the submission was already created upstream (optional)
        const { essay, chartData: rawChartData, questionId, submissionId, imagePath } = await req.json();

        if (!essay) {
            return NextResponse.json({ error: "Missing essay text" }, { status: 400 });
        }

        if (essay.length < 50) {
            return NextResponse.json({ error: "Essay must be at least 50 characters" }, { status: 400 });
        }

        // 3. Resolve the visual description
        // Priority: chartData (image upload path) → visual_description_json from DB (question bank path)
        let resolvedChartData = rawChartData ?? null;
        let resolvedImagePath = imagePath ?? null;
        let questionTitle = "IELTS Writing Task 1";

        if (!resolvedChartData && questionId) {
            // Fetch the question row from the 'questions' table
            const serviceClient = createServiceClient();
            const { data: qRow, error: qErr } = await serviceClient
                .from("questions")
                .select("visual_description_json, title, image_url")
                .eq("id", questionId)
                .single();

            if (qErr || !qRow) {
                return NextResponse.json(
                    { error: "Question not found or has no visual description." },
                    { status: 404 }
                );
            }

            resolvedChartData = qRow.visual_description_json;
            questionTitle = qRow.title ?? questionTitle;
            // No image path for question-bank path — image is already shown to student via imageUrl
        }

        if (!resolvedChartData) {
            return NextResponse.json(
                { error: "No visual description available for scoring. Please upload an image or select a question from the bank." },
                { status: 400 }
            );
        }

        // 4. Call Anthropic API
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service configuration missing" }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey });
        const userMessage = `CONFIRMED VISUAL DESCRIPTION:\n${JSON.stringify(resolvedChartData)}\n\nCANDIDATE ESSAY:\n${essay}`;

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

        // 5. Persistence
        const serviceClient = createServiceClient();
        let currentSubmissionId = submissionId;

        const promptTitle = (resolvedChartData?.title || questionTitle || "IELTS Writing Task 1").slice(0, 512);

        if (!currentSubmissionId) {
            // Auto-create a submission record for Task 1
            const { data: newSub, error: createError } = await serviceClient
                .from("essay_submissions")
                .insert({
                    user_id: user.id,
                    task_type: "task1",
                    prompt_text: promptTitle,
                    essay_text: essay,
                    image_path: resolvedImagePath || null,
                    chart_data: resolvedChartData,
                    word_count: essay.trim().split(/\s+/).length,
                    scoring_method: "ai_examiner"
                })
                .select("id")
                .single();

            if (createError) {
                console.error("Task 1 Submission creation error:", createError);
            } else {
                currentSubmissionId = newSub.id;
            }
        } else {
            // Update an existing submission
            const { error: updateError } = await serviceClient
                .from("essay_submissions")
                .update({
                    chart_data: resolvedChartData,
                    essay_text: essay,
                    word_count: essay.trim().split(/\s+/).length
                })
                .eq("id", currentSubmissionId);

            if (updateError) {
                console.error("Submission update error:", updateError);
            }
        }

        if (currentSubmissionId) {
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

            result.submissionId = currentSubmissionId;
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Task 1 scoring error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
