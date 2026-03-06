import { useState, useRef, useCallback } from "react";

// ─── PROMPT TEMPLATES ────────────────────────────────────────────────────────

const EXTRACTION_SYSTEM = `You are an expert IELTS examiner with extensive experience in Writing Task 1 visual analysis. Your role is to extract chart/diagram data with precision so that a student's essay can be accurately assessed for Task Achievement.

Analyse the uploaded image and return a JSON object ONLY — no markdown fences, no preamble — with this exact structure:
{
  "visual_type": "string (e.g. bar chart, line graph, pie chart, table, process diagram, map)",
  "title": "string — the chart/diagram title as written",
  "subject": "string — one sentence: what the visual shows and any time period or context",
  "units": "string — measurement units (e.g. percentage, millions, tonnes per year) or 'N/A'",
  "categories_or_axes": ["array of labels: x-axis categories, y-axis label, legend items, map regions, process stages, etc."],
  "key_data_points": ["array of strings — the most significant values, e.g. 'UK consumption peaked at 45% in 2005'"],
  "main_trends_or_features": ["array of strings — notable patterns, comparisons, turning points, proportions"],
  "overview_hint": "string — 2 sentences describing the two or three most striking overall features a Task 1 overview should capture"
}

Be precise with numbers. If a value is unclear due to image resolution, flag it with '~' prefix (e.g. '~32%'). If the visual is a process diagram or map, adapt the fields accordingly.`;

const EXTRACTION_USER = `Please analyse this IELTS Writing Task 1 visual prompt and extract all relevant data as specified.`;

const SCORING_SYSTEM = `You are a senior IELTS examiner certified to assess Writing Task 1 responses. You will receive:
1. A confirmed description of the Task 1 visual (extracted and verified)
2. A candidate's essay response

Score the response against the four official IELTS Writing band descriptors. Return a JSON object ONLY — no markdown fences, no preamble:
{
  "band_scores": {
    "task_achievement": number (0-9, half-bands permitted e.g. 6.5),
    "coherence_cohesion": number,
    "lexical_resource": number,
    "grammatical_range_accuracy": number,
    "overall": number
  },
  "feedback": {
    "task_achievement": {
      "strengths": ["array of strings"],
      "weaknesses": ["array of strings"],
      "missed_key_features": ["array of strings — data/trends from the visual the essay omitted or misreported"]
    },
    "coherence_cohesion": {
      "strengths": ["array of strings"],
      "weaknesses": ["array of strings"]
    },
    "lexical_resource": {
      "strengths": ["array of strings"],
      "weaknesses": ["array of strings"],
      "suggestions": ["array of strings — specific vocabulary upgrades"]
    },
    "grammatical_range_accuracy": {
      "strengths": ["array of strings"],
      "errors": ["array of strings — quote the error then suggest correction"],
      "range_comment": "string"
    }
  },
  "improved_sample": "string — a model paragraph (overview or body) demonstrating a higher-band response to the same visual",
  "examiner_summary": "string — 3–4 sentence holistic comment an IELTS examiner would write"
}

Overall band = mean of four criteria, rounded to nearest 0.5. Be rigorous: do not inflate scores. A Band 6 TA response addresses the task but has gaps; Band 7 covers key features with clear overview; Band 8 is fully representative with well-selected detail.`;

// ─── API CALLS ────────────────────────────────────────────────────────────────

async function extractChartData(base64Image, mediaType) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: EXTRACTION_SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: EXTRACTION_USER }
        ]
      }]
    })
  });
  const data = await response.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function scoreEssay(chartDescription, essay) {
  const userPrompt = `CONFIRMED VISUAL DESCRIPTION:\n${JSON.stringify(chartDescription, null, 2)}\n\nCANDIDATE ESSAY:\n${essay}`;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SCORING_SYSTEM,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  const data = await response.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const bandColour = (score) => {
  if (score >= 8) return "#22c55e";
  if (score >= 7) return "#84cc16";
  if (score >= 6) return "#eab308";
  if (score >= 5) return "#f97316";
  return "#ef4444";
};

const BandBadge = ({ score, label }) => (
  <div style={{
    background: "#1a1f2e", border: `2px solid ${bandColour(score)}`,
    borderRadius: "8px", padding: "12px 16px", textAlign: "center", minWidth: "120px"
  }}>
    <div style={{ fontSize: "28px", fontWeight: "800", color: bandColour(score), fontFamily: "Georgia, serif" }}>
      {score.toFixed(1)}
    </div>
    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </div>
  </div>
);

const FeedbackSection = ({ title, data, colour }) => (
  <div style={{ marginBottom: "20px" }}>
    <h4 style={{ color: colour, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "Georgia, serif" }}>
      {title}
    </h4>
    {data.strengths?.length > 0 && (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "600" }}>STRENGTHS</span>
        {data.strengths.map((s, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0 4px 12px", borderLeft: "2px solid #22c55e33", marginTop: "4px" }}>{s}</div>
        ))}
      </div>
    )}
    {data.weaknesses?.length > 0 && (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#f97316", fontWeight: "600" }}>WEAKNESSES</span>
        {data.weaknesses.map((s, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0 4px 12px", borderLeft: "2px solid #f9731633", marginTop: "4px" }}>{s}</div>
        ))}
      </div>
    )}
    {data.missed_key_features?.length > 0 && (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>MISSED / MISREPORTED DATA</span>
        {data.missed_key_features.map((s, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0 4px 12px", borderLeft: "2px solid #ef444433", marginTop: "4px" }}>{s}</div>
        ))}
      </div>
    )}
    {data.suggestions?.length > 0 && (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#a78bfa", fontWeight: "600" }}>VOCABULARY SUGGESTIONS</span>
        {data.suggestions.map((s, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0 4px 12px", borderLeft: "2px solid #a78bfa33", marginTop: "4px" }}>{s}</div>
        ))}
      </div>
    )}
    {data.errors?.length > 0 && (
      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>ERRORS</span>
        {data.errors.map((s, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0 4px 12px", borderLeft: "2px solid #ef444433", marginTop: "4px" }}>{s}</div>
        ))}
      </div>
    )}
    {data.range_comment && (
      <div style={{ fontSize: "13px", color: "#cbd5e1", padding: "6px 12px", background: "#1e2a3a", borderRadius: "6px", marginTop: "4px" }}>{data.range_comment}</div>
    )}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function IELTSTask1Pipeline() {
  const [step, setStep] = useState(1); // 1=upload, 2=confirm, 3=essay, 4=results
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMediaType, setImageMediaType] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [editedChartData, setEditedChartData] = useState(null);
  const [essay, setEssay] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleImageUpload = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type;
      setImageBase64(base64);
      setImageMediaType(mediaType);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleExtract = async () => {
    setLoading(true);
    setLoadingMsg("Analysing visual prompt…");
    setError(null);
    try {
      const data = await extractChartData(imageBase64, imageMediaType);
      setChartData(data);
      setEditedChartData(JSON.stringify(data, null, 2));
      setStep(2);
    } catch (e) {
      setError("Extraction failed: " + e.message);
    }
    setLoading(false);
  };

  const handleScore = async () => {
    if (essay.trim().length < 50) { setError("Essay too short — minimum 50 characters."); return; }
    setLoading(true);
    setLoadingMsg("Scoring essay against IELTS band descriptors…");
    setError(null);
    try {
      let confirmedData;
      try { confirmedData = JSON.parse(editedChartData); }
      catch { setError("Chart description JSON is invalid. Please fix formatting."); setLoading(false); return; }
      const res = await scoreEssay(confirmedData, essay);
      setResults(res);
      setStep(4);
    } catch (e) {
      setError("Scoring failed: " + e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(1); setImagePreview(null); setImageBase64(null); setImageMediaType(null);
    setChartData(null); setEditedChartData(null); setEssay(""); setResults(null); setError(null);
  };

  const S = {
    wrap: { minHeight: "100vh", background: "#0d1117", fontFamily: "'Crimson Text', Georgia, serif", color: "#e2e8f0", padding: "0" },
    header: { background: "#111827", borderBottom: "1px solid #1e2a3a", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px" },
    logo: { fontSize: "20px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.02em" },
    logoAccent: { color: "#c084fc" },
    badge: { fontSize: "11px", background: "#1e2a3a", color: "#94a3b8", padding: "3px 10px", borderRadius: "20px", border: "1px solid #2d3748" },
    main: { maxWidth: "900px", margin: "0 auto", padding: "40px 24px" },
    stepBar: { display: "flex", gap: "8px", marginBottom: "36px" },
    stepDot: (active, done) => ({
      height: "4px", flex: 1, borderRadius: "2px",
      background: done ? "#c084fc" : active ? "#7c3aed" : "#1e2a3a",
      transition: "background 0.3s"
    }),
    card: { background: "#111827", border: "1px solid #1e2a3a", borderRadius: "12px", padding: "28px" },
    label: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: "8px", display: "block", fontFamily: "system-ui, sans-serif" },
    title: { fontSize: "22px", fontWeight: "700", color: "#f1f5f9", marginBottom: "8px", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "14px", color: "#64748b", marginBottom: "24px", fontFamily: "system-ui, sans-serif", lineHeight: "1.5" },
    uploadZone: {
      border: "2px dashed #2d3748", borderRadius: "10px", padding: "48px 24px",
      textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
      background: "#0d1117"
    },
    btn: (variant = "primary") => ({
      padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
      fontSize: "14px", fontWeight: "600", fontFamily: "system-ui, sans-serif",
      background: variant === "primary" ? "#7c3aed" : variant === "secondary" ? "#1e2a3a" : "#1a2744",
      color: variant === "primary" ? "#fff" : "#94a3b8",
      transition: "opacity 0.2s"
    }),
    textarea: {
      width: "100%", background: "#0d1117", border: "1px solid #2d3748", borderRadius: "8px",
      color: "#e2e8f0", padding: "14px", fontSize: "14px", lineHeight: "1.7",
      fontFamily: "system-ui, sans-serif", resize: "vertical", boxSizing: "border-box"
    },
    mono: {
      width: "100%", background: "#0d1117", border: "1px solid #2d3748", borderRadius: "8px",
      color: "#a78bfa", padding: "14px", fontSize: "12px", lineHeight: "1.6",
      fontFamily: "monospace", resize: "vertical", boxSizing: "border-box"
    },
    divider: { border: "none", borderTop: "1px solid #1e2a3a", margin: "20px 0" }
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={S.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={S.header}>
        <div style={S.logo}>Jaxtina <span style={S.logoAccent}>IELTS</span></div>
        <div style={S.badge}>Task 1 Scoring Pipeline</div>
        {step > 1 && <button onClick={reset} style={{ ...S.btn("secondary"), marginLeft: "auto", fontSize: "12px", padding: "6px 14px" }}>← New Question</button>}
      </header>

      <main style={S.main}>
        {/* Step bar */}
        <div style={S.stepBar}>
          {["Upload Visual", "Confirm Data", "Submit Essay", "Results"].map((_, i) => (
            <div key={i} style={S.stepDot(step === i + 1, step > i + 1)} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#fca5a5", fontFamily: "system-ui, sans-serif" }}>
            {error}
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div style={S.card}>
            <span style={S.label}>Step 1 of 4</span>
            <h2 style={S.title}>Upload Task 1 Visual Prompt</h2>
            <p style={S.subtitle}>Upload a screenshot or image of the IELTS Writing Task 1 question. Claude will extract the chart data before scoring begins, ensuring Task Achievement is assessed against the actual visual — not assumptions.</p>
            <div
              style={S.uploadZone}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ maxWidth: "100%", maxHeight: "320px", borderRadius: "6px" }} />
              ) : (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
                  <div style={{ color: "#94a3b8", fontSize: "14px", fontFamily: "system-ui, sans-serif" }}>
                    Drop image here or <span style={{ color: "#c084fc" }}>click to browse</span>
                  </div>
                  <div style={{ color: "#4b5563", fontSize: "12px", marginTop: "6px", fontFamily: "system-ui, sans-serif" }}>PNG, JPG, WEBP supported</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files[0])} />
            {imagePreview && (
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button onClick={handleExtract} disabled={loading} style={S.btn("primary")}>
                  {loading ? loadingMsg : "Extract Chart Data →"}
                </button>
                <button onClick={() => { setImagePreview(null); setImageBase64(null); }} style={S.btn("secondary")}>Remove</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Confirm */}
        {step === 2 && chartData && (
          <div>
            <div style={S.card}>
              <span style={S.label}>Step 2 of 4</span>
              <h2 style={S.title}>Confirm Chart Interpretation</h2>
              <p style={S.subtitle}>Review Claude's extraction of the visual below. Correct any misread values before proceeding — this description will anchor all Task Achievement scoring.</p>

              {/* Summary view */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[
                  ["Visual Type", chartData.visual_type],
                  ["Title", chartData.title],
                  ["Units", chartData.units],
                  ["Subject", chartData.subject],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#0d1117", borderRadius: "8px", padding: "12px", border: "1px solid #1e2a3a" }}>
                    <div style={{ fontSize: "10px", color: "#4b5563", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{k}</div>
                    <div style={{ fontSize: "13px", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#4b5563", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Overview Hint (what a strong overview should capture)</div>
                <div style={{ background: "#0d1117", borderRadius: "8px", padding: "12px", border: "1px solid #1e2a3a", fontSize: "13px", color: "#a78bfa", fontFamily: "system-ui, sans-serif", lineHeight: "1.6" }}>
                  {chartData.overview_hint}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#4b5563", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Key Data Points</div>
                {chartData.key_data_points?.map((pt, i) => (
                  <div key={i} style={{ fontSize: "13px", color: "#cbd5e1", padding: "4px 0", fontFamily: "system-ui, sans-serif" }}>• {pt}</div>
                ))}
              </div>

              <hr style={S.divider} />

              <div style={{ marginBottom: "8px" }}>
                <span style={{ ...S.label, display: "block", marginBottom: "6px" }}>Advanced: Edit Raw JSON (optional)</span>
                <textarea
                  value={editedChartData}
                  onChange={(e) => setEditedChartData(e.target.value)}
                  rows={12}
                  style={S.mono}
                />
                <div style={{ fontSize: "11px", color: "#4b5563", fontFamily: "system-ui, sans-serif", marginTop: "4px" }}>
                  Edit if any values are misread. JSON must remain valid.
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={() => setStep(3)} style={S.btn("primary")}>Confirm & Continue →</button>
                <button onClick={() => setStep(1)} style={S.btn("secondary")}>← Re-upload</button>
              </div>
            </div>

            {imagePreview && (
              <div style={{ ...S.card, marginTop: "16px" }}>
                <span style={S.label}>Original Image</span>
                <img src={imagePreview} alt="task" style={{ maxWidth: "100%", borderRadius: "6px" }} />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Essay */}
        {step === 3 && (
          <div style={S.card}>
            <span style={S.label}>Step 3 of 4</span>
            <h2 style={S.title}>Paste Student Essay</h2>
            <p style={S.subtitle}>Minimum 150 words recommended. The essay will be scored against the confirmed visual description above.</p>

            {chartData && (
              <div style={{ background: "#0d1117", borderRadius: "8px", padding: "12px", border: "1px solid #1e2a3a", marginBottom: "20px", fontSize: "13px", color: "#64748b", fontFamily: "system-ui, sans-serif" }}>
                <strong style={{ color: "#7c3aed" }}>Visual: </strong>{chartData.visual_type} — {chartData.title}
              </div>
            )}

            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              rows={14}
              placeholder="Paste the student's essay here…"
              style={S.textarea}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <div style={{ fontSize: "12px", color: wordCount >= 150 ? "#22c55e" : "#f97316", fontFamily: "system-ui, sans-serif" }}>
                {wordCount} words {wordCount < 150 ? "(below 150 recommended)" : "✓"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleScore} disabled={loading || essay.trim().length < 50} style={{ ...S.btn("primary"), opacity: essay.trim().length < 50 ? 0.5 : 1 }}>
                {loading ? loadingMsg : "Score Essay →"}
              </button>
              <button onClick={() => setStep(2)} style={S.btn("secondary")}>← Back</button>
            </div>
          </div>
        )}

        {/* STEP 4: Results */}
        {step === 4 && results && (
          <div>
            {/* Band scores */}
            <div style={S.card}>
              <span style={S.label}>Step 4 of 4 — Results</span>
              <h2 style={S.title}>Score Report</h2>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <BandBadge score={results.band_scores.overall} label="Overall Band" />
                <BandBadge score={results.band_scores.task_achievement} label="Task Achievement" />
                <BandBadge score={results.band_scores.coherence_cohesion} label="Coherence & Cohesion" />
                <BandBadge score={results.band_scores.lexical_resource} label="Lexical Resource" />
                <BandBadge score={results.band_scores.grammatical_range_accuracy} label="Grammar & Range" />
              </div>

              <div style={{ background: "#0d1117", borderRadius: "8px", padding: "16px", border: "1px solid #1e2a3a", marginBottom: "24px", fontSize: "14px", color: "#94a3b8", fontFamily: "system-ui, sans-serif", lineHeight: "1.7", fontStyle: "italic" }}>
                "{results.examiner_summary}"
              </div>

              <hr style={S.divider} />

              {/* Detailed feedback */}
              <FeedbackSection title="Task Achievement" data={results.feedback.task_achievement} colour="#c084fc" />
              <FeedbackSection title="Coherence & Cohesion" data={results.feedback.coherence_cohesion} colour="#38bdf8" />
              <FeedbackSection title="Lexical Resource" data={results.feedback.lexical_resource} colour="#a78bfa" />
              <FeedbackSection title="Grammatical Range & Accuracy" data={results.feedback.grammatical_range_accuracy} colour="#34d399" />

              {results.improved_sample && (
                <>
                  <hr style={S.divider} />
                  <div>
                    <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "600", fontFamily: "system-ui, sans-serif", letterSpacing: "0.08em" }}>MODEL PARAGRAPH (Higher-Band Demonstration)</span>
                    <div style={{ background: "#0d1117", borderRadius: "8px", padding: "14px", border: "1px solid #1e2a3a", marginTop: "8px", fontSize: "14px", color: "#cbd5e1", lineHeight: "1.8" }}>
                      {results.improved_sample}
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop: "24px" }}>
                <button onClick={reset} style={S.btn("primary")}>Score Another Essay</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
