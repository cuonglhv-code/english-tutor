import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const EXTRACTION_SYSTEM = `You are an expert IELTS examiner specialising in 
Writing Task 1 visual analysis. Your output will be used directly by a marking 
system to assess candidate essays — accuracy and completeness of extraction 
are therefore critical to fair scoring.

Analyse the uploaded image carefully. Identify the visual type first, then apply 
the appropriate extraction schema below.

Return a JSON object ONLY — no markdown fences, no preamble.

---

STEP 1 — IDENTIFY VISUAL TYPE

Classify the image as one of:
  "statistical_chart"   (bar chart, line graph, pie chart, table, scatter plot)
  "process_diagram"     (flowchart, cycle diagram, linear process with stages)
  "map"                 (geographical map showing change over time or comparison)
  "mixed"               (e.g. bar chart + line graph on shared axes)

This classification determines which schema to apply in Step 2.

---

STEP 2 — EXTRACT USING THE APPROPRIATE SCHEMA

[A] FOR statistical_chart:

{
  "visual_type": "string — specific type, e.g. 'grouped bar chart', 'multi-line graph', 
                  'pie chart', 'table'",
  "title": "string — exact title as written on the visual",
  "subject": "string — one sentence: what is measured, the population or context, 
               and the time period if stated",
  "units": "string — the unit of measurement (e.g. '% of respondents', 
             'millions of tonnes', 'USD billions') or 'N/A'",
  "axes_and_legend": {
    "x_axis": "string — label and range or categories",
    "y_axis": "string — label and scale range",
    "legend_items": ["array — all series, categories, or segments with their labels"]
  },
  "critical_data_points": {
    "highest_values": ["array — the peak value(s) with category and time reference, 
                        e.g. 'Japan: 78% in 2010 (highest overall)'"],
    "lowest_values": ["array — the lowest value(s) with category and time reference"],
    "notable_crossovers_or_intersections": ["array — where series converge or overtake 
                                             each other, if applicable; 'N/A' if none"],
    "start_and_end_values": ["array — for time-series data, the opening and closing 
                              values per series, e.g. 'UK: 30% (2000) → 52% (2020)'"],
    "approximate_values": ["array — values estimated from the chart due to absent 
                            gridlines or ambiguous scaling; prefix with '~'"]
  },
  "comparative_relationships": ["array — explicit relational observations, e.g. 
                                  'Germany consistently outperformed France throughout'"],
  "overall_trends": ["array — dominant directional movement per series with magnitude"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — 2–3 macro-level features a Band 7+ overview 
                                    MUST capture"],
    "essential_body_detail": ["array — specific data points or comparisons central to 
                               Task Achievement"],
    "peripheral_detail": ["array — data a well-organised essay may legitimately omit"]
  },
  "potential_candidate_errors": ["array — values or trends easily misread or misreported"]
}

---

[B] FOR process_diagram:

{
  "visual_type": "string — e.g. 'linear process diagram', 'cyclical process diagram'",
  "title": "string — exact title as written",
  "subject": "string — one sentence: what process is depicted and its context",
  "process_structure": "string — 'linear' or 'cyclical'",
  "total_stages": "number — count of distinct stages",
  "stages": [
    {
      "stage_number": "number",
      "label": "string — the stage name or action as written on the diagram",
      "description": "string — what occurs at this stage, including materials, 
                      agents, or transformations shown",
      "inputs": ["array — materials or elements entering this stage, or 'N/A'"],
      "outputs": ["array — materials or elements leaving this stage, or 'N/A'"]
    }
  ],
  "key_transformations": ["array — most significant changes of state or form"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — total stages, start/end points, 
                                    linear or cyclical, what is produced"],
    "essential_body_detail": ["array — specific stages or transformations required 
                               for full Task Achievement"],
    "peripheral_detail": ["array — minor sub-steps that may be omitted without penalty"]
  },
  "potential_candidate_errors": ["array — stages likely to be misread or conflated"]
}

---

[C] FOR map:

{
  "visual_type": "string — e.g. 'town plan comparison map'",
  "title": "string — exact title as written",
  "subject": "string — location, aspect depicted, and time period(s) if stated",
  "time_points": ["array — dates or periods shown, e.g. ['1990', '2020']"],
  "map_features": {
    "regions_or_zones": ["array — named areas or districts marked on the map"],
    "key_symbols_or_legend_items": ["array — all symbols or legend entries with meanings"]
  },
  "changes_or_contrasts": ["array — explicit spatial changes between time points"],
  "what_remained_unchanged": ["array — features stable across time points, or 'N/A'"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — 2–3 most striking macro-level changes"],
    "essential_body_detail": ["array — specific spatial changes central to Task Achievement"],
    "peripheral_detail": ["array — minor features that may be omitted without penalty"]
  },
  "potential_candidate_errors": ["array — features easily misread due to complexity"]
}

---

[D] FOR mixed (e.g. bar + line on shared axes):

Apply schema [A] for the primary chart type, then add:

"secondary_visual": {
  "type": "string — the secondary chart type",
  "series": ["array — data series belonging to the secondary visual"],
  "relationship_to_primary": "string — what comparing the two visuals reveals"
}

---

STEP 3 — VALIDITY CHECK

If the image is not a recognisable IELTS Writing Task 1 visual prompt, return:
{ "error": "Not a recognisable IELTS Task 1 visual prompt" }

If valid but partially illegible, extract what is visible, prefix uncertain values 
with '~', and add:
"legibility_warnings": ["array — elements that could not be read reliably and why"]`;

// ─── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Increased substantially from 1000 to handle the full typed schema output.
// A populated statistical_chart JSON with multiple series routinely exceeds
// 1200 tokens; process diagrams with 8+ stages can reach 1800+.
const MAX_TOKENS = 4000;

// ─── Schema validation ────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ["visual_type"] as const;
const VALID_VISUAL_TYPES = [
    "statistical_chart",
    "process_diagram",
    "map",
    "mixed",
] as const;

function validateExtractionResult(data: unknown): {
    valid: boolean;
    warnings: string[];
} {
    const warnings: string[] = [];

    if (typeof data !== "object" || data === null) {
        return { valid: false, warnings: ["Response is not a JSON object"] };
    }

    const obj = data as Record<string, unknown>;

    for (const field of REQUIRED_FIELDS) {
        if (!(field in obj)) {
            warnings.push(`Missing required field: ${field}`);
        }
    }

    if (
        obj.visual_type &&
        !VALID_VISUAL_TYPES.includes(obj.visual_type as any)
    ) {
        warnings.push(
            `Unrecognised visual_type: "${obj.visual_type}". ` +
            `Expected one of: ${VALID_VISUAL_TYPES.join(", ")}`
        );
    }

    // Warn if examiner_critical_features is absent — the marking step depends on it
    if (!obj.examiner_critical_features) {
        warnings.push(
            "examiner_critical_features is absent — marking quality will be degraded"
        );
    }

    return { valid: warnings.length === 0, warnings };
}

// ─── Robust JSON extraction ───────────────────────────────────────────────────

function extractJSON(raw: string): unknown {
    // Strip markdown fences if present
    const stripped = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    // Attempt direct parse first
    try {
        return JSON.parse(stripped);
    } catch {
        // Fall back: find the outermost JSON object
        const start = stripped.indexOf("{");
        const end = stripped.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(stripped.slice(start, end + 1));
            } catch {
                throw new Error(
                    "AI response could not be parsed as JSON. " +
                    "The response may have been truncated — check MAX_TOKENS."
                );
            }
        }
        throw new Error("No JSON object found in AI response.");
    }
}

// ─── Storage cleanup helper ───────────────────────────────────────────────────

async function removeOrphanedUpload(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<void> {
    try {
        await supabase.storage.from("task1-images").remove([storagePath]);
    } catch (cleanupError) {
        // Log but do not re-throw — we are already in an error path
        console.warn("Failed to remove orphaned upload:", storagePath, cleanupError);
    }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    let storagePath: string | null = null;

    try {
        // 1. Auth check
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse and validate multipart data
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
            return NextResponse.json(
                { error: "Invalid file type. Accepted formats: PNG, JPEG, WEBP." },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5 MB." },
                { status: 400 }
            );
        }

        // 3. Read buffer once; reuse for both upload and base64
        const buffer = await file.arrayBuffer();
        const timestamp = Date.now();
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        storagePath = `${user.id}/${timestamp}-${safeFilename}`;

        // 4. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("task1-images")
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            storagePath = null; // Nothing to clean up — upload failed
            return NextResponse.json(
                { error: "Failed to upload image to storage." },
                { status: 500 }
            );
        }

        // 5. Call Anthropic Vision API
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            await removeOrphanedUpload(supabase, storagePath);
            return NextResponse.json(
                { error: "AI service configuration missing." },
                { status: 500 }
            );
        }

        const anthropic = new Anthropic({ apiKey });
        const base64Image = Buffer.from(buffer).toString("base64");

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: MAX_TOKENS,
            system: EXTRACTION_SYSTEM,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                // Safe cast: file.type is already validated against ALLOWED_MIME_TYPES
                                media_type: file.type as AllowedMimeType,
                                data: base64Image,
                            },
                        },
                        {
                            type: "text",
                            // More directive user turn: reinforces the three-step workflow
                            // defined in the system prompt without duplicating schema detail
                            text: `Analyse this IELTS Writing Task 1 image. 
Follow the three steps in your instructions exactly:
1. Classify the visual type.
2. Apply the corresponding schema for that type.
3. Return the completed JSON object only — no preamble, no markdown fences.`,
                        },
                    ],
                },
            ],
        });

        // 6. Parse and validate response
        const content = message.content[0];
        if (!content || content.type !== "text") {
            await removeOrphanedUpload(supabase, storagePath);
            throw new Error("Unexpected response structure from AI service.");
        }

        let chartData: unknown;
        try {
            chartData = extractJSON(content.text);
        } catch (parseError: any) {
            await removeOrphanedUpload(supabase, storagePath);
            console.error("JSON parse failure:", parseError.message);
            console.error("Raw AI response:", content.text);
            return NextResponse.json(
                {
                    error: "AI response could not be parsed. " +
                        "If this persists, the visual may be too complex — try a clearer image.",
                },
                { status: 422 }
            );
        }

        // Handle model-reported errors (e.g., unrecognised visual)
        if (
            typeof chartData === "object" &&
            chartData !== null &&
            "error" in chartData
        ) {
            await removeOrphanedUpload(supabase, storagePath);
            return NextResponse.json(
                { error: (chartData as { error: string }).error },
                { status: 422 }
            );
        }

        // Validate schema completeness; surface warnings but do not block
        const { valid, warnings } = validateExtractionResult(chartData);
        if (!valid || warnings.length > 0) {
            console.warn("Extraction schema warnings:", warnings);
        }

        return NextResponse.json({
            imagePath: storagePath,
            chartData,
            ...(warnings.length > 0 && { extractionWarnings: warnings }),
        });

    } catch (error: any) {
        // If a storagePath was set, the upload succeeded — clean it up
        if (storagePath) {
            const supabase = await createClient();
            await removeOrphanedUpload(supabase, storagePath);
        }
        console.error("Task 1 extraction error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error." },
            { status: 500 }
        );
    }
}