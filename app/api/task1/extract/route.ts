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
    "approximate_values": ["array — values that must be estimated from the chart 
                            due to absent gridlines or ambiguous scaling; 
                            prefix with '~', e.g. '~35% in 2005'"]
  },
  "comparative_relationships": ["array — explicit relational observations, e.g. 
                                  'Germany consistently outperformed France throughout', 
                                  'Category A declined while B rose sharply after 2005', 
                                  'All categories converged by 2020'"],
  "overall_trends": ["array — the dominant directional movements per series: 
                      'rose', 'fell', 'fluctuated', 'remained stable', 
                      with approximate magnitude where readable"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — the 2–3 macro-level features a Band 7+ 
                                    overview MUST capture to demonstrate global understanding; 
                                    e.g. 'overall upward trend across all categories', 
                                    'X was consistently the highest throughout'"],
    "essential_body_detail": ["array — specific data points or comparisons the essay 
                               must report to achieve full Task Achievement; 
                               these are features central to the visual's argument"],
    "peripheral_detail": ["array — data that a well-organised essay may legitimately 
                           omit without penalty; minor fluctuations, secondary categories 
                           with little comparative significance"]
  },
  "potential_candidate_errors": ["array — values or trends that are counterintuitive 
                                  or easily misread; flag these so the marker can 
                                  identify factual errors in the essay, 
                                  e.g. 'the 2015 dip is subtle and may be missed or 
                                  misreported as a plateau'"]
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
      "description": "string — what occurs at this stage, including any materials, 
                      agents, or transformations shown",
      "inputs": ["array — materials or elements entering this stage, or 'N/A'"],
      "outputs": ["array — materials or elements leaving this stage, or 'N/A'"]
    }
  ],
  "key_transformations": ["array — the most significant changes of state, material, 
                           or form across the process"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — the macro-level features a Band 7+ overview 
                                    must capture: total stages, start and end points, 
                                    whether the process is linear or cyclical, 
                                    what is broadly produced or achieved"],
    "essential_body_detail": ["array — specific stages or transformations that must be 
                               described to achieve full Task Achievement"],
    "peripheral_detail": ["array — minor sub-steps or labels that may be omitted 
                           without significant penalty"]
  },
  "potential_candidate_errors": ["array — stages likely to be misread, omitted, 
                                  or conflated"]
}

---

[C] FOR map:

{
  "visual_type": "string — e.g. 'town plan comparison map', 'geographical distribution map'",
  "title": "string — exact title as written",
  "subject": "string — one sentence: what location is shown, what aspect is depicted, 
               and the time period(s) if stated",
  "time_points": ["array — the dates or periods shown, e.g. ['1990', '2020'] 
                   or ['N/A — single time point']"],
  "map_features": {
    "regions_or_zones": ["array — named areas, districts, or zones marked on the map"],
    "key_symbols_or_legend_items": ["array — all symbols, shading categories, 
                                     or legend entries with their meanings"]
  },
  "changes_or_contrasts": ["array — explicit spatial changes between time points 
                             or contrasts between regions, e.g. 
                             'industrial area in the north replaced by housing by 2020', 
                             'road network expanded significantly in the east'"],
  "what_remained_unchanged": ["array — features stable across time points, or 'N/A'"],
  "examiner_critical_features": {
    "mandatory_overview_content": ["array — the 2–3 most striking macro-level changes 
                                    or contrasts a Band 7+ overview must capture"],
    "essential_body_detail": ["array — specific spatial changes central to Task Achievement"],
    "peripheral_detail": ["array — minor features or unchanged elements that may be 
                           omitted without penalty"]
  },
  "potential_candidate_errors": ["array — features easily misread due to map complexity, 
                                  overlapping symbols, or ambiguous legend entries"]
}

---

[D] FOR mixed (e.g. bar + line on shared axes):

Apply schema [A] for the primary chart type. Add the following additional field:

"secondary_visual": {
  "type": "string — the secondary chart type",
  "series": ["array — the data series belonging to the secondary visual"],
  "relationship_to_primary": "string — how the two visuals interact or what 
                               comparing them reveals"
}

---

STEP 3 — VALIDITY CHECK

If the image is not a recognisable IELTS Writing Task 1 visual prompt, return:
{ "error": "Not a recognisable IELTS Task 1 visual prompt" }

If the image is valid but partially illegible (e.g. low resolution, cut-off labels):
- Extract what is clearly visible
- Prefix estimated or uncertain values with '~'
- Add a top-level field: "legibility_warnings": ["array — specific elements that 
  could not be read reliably and why"]`;

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
