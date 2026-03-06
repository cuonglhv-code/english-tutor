import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const EXTRACTION_SYSTEM = `You are an expert IELTS examiner specialising in Writing Task 1 visual analysis. 
Analyse the uploaded image and return a JSON object ONLY — no markdown fences, 
no preamble — with this exact structure:
{
  "visual_type": "string (e.g. bar chart, line graph, pie chart, table, process diagram, map)",
  "title": "string — the chart/diagram title as written",
  "subject": "string — one sentence: what the visual shows and any time period or context",
  "units": "string — measurement units or 'N/A'",
  "categories_or_axes": ["array of axis labels, legend items, map regions, or process stages"],
  "key_data_points": ["array — the most significant values as strings, e.g. 'UK peaked at 45% in 2005'"],
  "main_trends_or_features": ["array — notable patterns, comparisons, turning points"],
  "overview_hint": "string — 2 sentences: the two or three most striking overall features a Task 1 overview must capture"
}
Flag any unclear values with a '~' prefix. If it is not an IELTS Task 1 visual, 
return { "error": "Not a recognisable IELTS Task 1 visual prompt" }.`;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse and validate multipart data
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only PNG, JPEG, and WEBP are allowed." }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
        }

        // 3. Upload to Supabase Storage
        const buffer = await file.arrayBuffer();
        const timestamp = Date.now();
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storagePath = `${user.id}/${timestamp}-${safeFilename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("task1-images")
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
        }

        // 4. Call Anthropic Vision API
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service configuration missing" }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey });
        const base64Image = Buffer.from(buffer).toString("base64");

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            system: EXTRACTION_SYSTEM,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                                data: base64Image,
                            },
                        },
                        {
                            type: "text",
                            text: "Please analyse this IELTS Writing Task 1 visual prompt and extract all data.",
                        },
                    ],
                },
            ],
        });

        const content = message.content[0];
        if (content.type !== "text") {
            throw new Error("Unexpected response type from AI");
        }

        const jsonMatch = content.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const chartData = JSON.parse(jsonMatch);

        if (chartData.error) {
            return NextResponse.json({ error: chartData.error }, { status: 422 });
        }

        return NextResponse.json({
            imagePath: storagePath,
            chartData
        });

    } catch (error: any) {
        console.error("Task 1 extraction error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
