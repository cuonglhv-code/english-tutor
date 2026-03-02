import type { WizardData, AnalysisResult, BandScores, CriterionFeedback } from "@/types";
import { getDescriptor, getNextDescriptor } from "@/lib/descriptors";
import { roundToHalfBand } from "@/lib/utils";

const COHESION_MARKERS = [
  "however", "furthermore", "moreover", "nevertheless", "consequently",
  "therefore", "in addition", "on the other hand", "in contrast",
  "as a result", "for example", "for instance", "in conclusion",
  "to begin with", "firstly", "secondly", "thirdly", "finally",
  "additionally", "alternatively", "similarly", "despite", "although",
  "whereas", "while", "thus", "hence", "nonetheless", "accordingly",
  "subsequently", "by contrast", "in particular", "for this reason",
  "that said", "having said that", "in spite of", "even though",
  "on the contrary", "in other words", "to illustrate",
];

const ADVANCED_VOCAB = [
  "significant", "substantial", "predominantly", "consequently", "illustrate",
  "demonstrate", "indicate", "suggest", "reveal", "highlight", "emphasize",
  "comprehensive", "considerable", "approximately", "proportion", "majority",
  "minority", "fluctuation", "dramatic", "gradual", "steady", "rapid",
  "perspective", "framework", "fundamental", "facilitate", "contribute",
  "generate", "establish", "maintain", "enhance", "emerge", "evolve",
  "transform", "distinguish", "advocate", "acknowledge", "correlation",
  "phenomenon", "simultaneously", "arguably", "inevitably", "increasingly",
  "respectively", "notably", "primarily", "ultimately", "essentially",
  "nonetheless", "thereby", "ascertain", "proliferate", "exacerbate",
];

const COLLOCATIONS = [
  "a wide range of", "plays a vital role", "on the one hand",
  "on the other hand", "a significant increase", "a dramatic rise",
  "a steady decline", "it is worth noting", "in terms of",
  "with regard to", "as far as", "in light of", "regardless of",
  "to a certain extent", "by and large", "a growing number of",
];

function extractSentences(text: string): string[] {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
}

function calculateTA(
  essay: string,
  wordCount: number,
  minWords: number,
  taskType: string,
  taskNumber: string,
  question: string
): number {
  let score = 5.5;
  const essayLower = essay.toLowerCase();

  if (wordCount < minWords * 0.6) score -= 2.0;
  else if (wordCount < minWords * 0.8) score -= 1.5;
  else if (wordCount < minWords) score -= 0.5;
  else if (wordCount > minWords * 1.6) score += 0.5;

  const paragraphs = essay.split(/\n\n+/).filter((p) => p.trim().length > 40);
  if (taskNumber === "1") {
    if (paragraphs.length >= 3) score += 0.5;
    if (/overall|in general|it can be seen|it is clear|the (chart|graph|table|diagram|figure)/i.test(essay)) score += 0.5;
  } else {
    if (paragraphs.length >= 4) score += 0.5;
    if (/i believe|in my opinion|i would argue|it is my view|this essay|this report/i.test(essay)) score += 0.3;
    if (/in conclusion|to conclude|to sum up|overall|in summary/i.test(essay)) score += 0.5;
    if (/on the one hand|on the other hand|however|conversely/i.test(essay)) score += 0.3;
  }

  const questionWords = (question || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !/discuss|essay|write|about|what|how|why|should|would|could/.test(w));
  if (questionWords.length > 0) {
    const covered = questionWords.filter((w) => essayLower.includes(w)).length;
    const ratio = covered / questionWords.length;
    if (ratio > 0.7) score += 0.5;
    else if (ratio < 0.3) score -= 0.5;
  }

  return Math.max(1, Math.min(9, score));
}

function calculateCC(essay: string): number {
  let score = 5.0;
  const essayLower = essay.toLowerCase();

  const used = COHESION_MARKERS.filter((m) => essayLower.includes(m));
  if (used.length >= 10) score += 2.0;
  else if (used.length >= 7) score += 1.5;
  else if (used.length >= 4) score += 1.0;
  else if (used.length >= 2) score += 0.5;
  else score -= 0.5;

  const refCount = ["this", "these", "those", "such", "it", "they", "them", "their"].filter((r) =>
    new RegExp(`\\b${r}\\b`, "i").test(essay)
  ).length;
  if (refCount >= 5) score += 0.5;

  const paragraphs = essay.split(/\n\n+/).filter((p) => p.trim().length > 30);
  if (paragraphs.length >= 4) score += 0.5;
  else if (paragraphs.length === 3) score += 0.3;
  else if (paragraphs.length <= 1) score -= 0.5;

  return Math.max(1, Math.min(9, score));
}

function calculateLR(essay: string): number {
  let score = 5.0;
  const essayLower = essay.toLowerCase();
  const words = essay.split(/\s+/).filter((w) => w.length > 0);

  const unique = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter((w) => w.length > 2)
  );
  const ttr = words.length > 0 ? unique.size / words.length : 0;
  if (ttr > 0.7) score += 2.0;
  else if (ttr > 0.6) score += 1.5;
  else if (ttr > 0.5) score += 1.0;
  else if (ttr > 0.4) score += 0.5;
  else score -= 0.5;

  const advCount = ADVANCED_VOCAB.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(essay)).length;
  if (advCount >= 12) score += 1.5;
  else if (advCount >= 8) score += 1.0;
  else if (advCount >= 4) score += 0.5;
  else score -= 0.3;

  const collCount = COLLOCATIONS.filter((c) => essayLower.includes(c)).length;
  if (collCount >= 3) score += 0.5;
  else if (collCount >= 1) score += 0.2;

  return Math.max(1, Math.min(9, score));
}

function calculateGRA(essay: string): number {
  let score = 5.0;
  const sentences = extractSentences(essay);
  if (sentences.length === 0) return 1;

  const complexPatterns = [
    /\b(although|whereas|while|even though|despite the fact that)\b/i,
    /\b(which|that|who|whom|whose)\b/i,
    /\b(not only|but also)\b/i,
    /\b(if|unless|provided that|as long as)\b/i,
    /\b(since|because|due to|owing to)\b/i,
    /\b(having|being)\s+\w+ed\b/i,
  ];
  const complexCount = sentences.filter((s) => complexPatterns.some((p) => p.test(s))).length;
  const complexRatio = complexCount / sentences.length;

  if (complexRatio > 0.7) score += 2.0;
  else if (complexRatio > 0.5) score += 1.5;
  else if (complexRatio > 0.3) score += 1.0;
  else if (complexRatio > 0.1) score += 0.5;
  else score -= 0.5;

  const words = essay.split(/\s+/).filter((w) => w.length > 0);
  const avgLen = words.length / Math.max(sentences.length, 1);
  if (avgLen >= 22) score += 0.5;
  else if (avgLen >= 18) score += 0.3;
  else if (avgLen < 10) score -= 0.5;

  const passiveMatches = essay.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];
  if (passiveMatches.length >= 2) score += 0.3;

  const starters = sentences
    .map((s) => s.trim().split(/\s+/)[0]?.toLowerCase())
    .filter(Boolean);
  const uniqueStarters = new Set(starters);
  if (starters.length > 0 && uniqueStarters.size / starters.length > 0.65) score += 0.3;

  return Math.max(1, Math.min(9, score));
}

function generateCriterionFeedback(
  criterion: "ta" | "cc" | "lr" | "gra",
  score: number,
  essay: string,
  taskType: "academic" | "general",
  taskNumber: "1" | "2",
  label: string
): CriterionFeedback {
  const descriptorCurrent = getDescriptor(criterion, Math.floor(score), taskType, taskNumber);
  const descriptorNext = getNextDescriptor(criterion, score, taskType, taskNumber);
  const nextBand = roundToHalfBand(Math.ceil(score * 2) / 2 + 0.5);

  const wellDones: Record<string, string> = {
    ta:
      taskNumber === "1"
        ? "Your response selects and presents key features from the data. You have attempted to cover the main trends in your writing."
        : "Your response addresses the question and presents a viewpoint. You have attempted to structure your argument with an introduction and body paragraphs.",
    cc: "You have used cohesive devices to connect your ideas. There is an overall structure visible in your response with paragraphing attempted.",
    lr: "You have attempted to use a variety of vocabulary rather than repeating the same words. Some topic-specific language is evident.",
    gra: "You have attempted to use a variety of sentence structures including some complex sentences. Some error-free sentences demonstrate grammatical competence.",
  };

  const improvements: Record<string, string> = {
    ta:
      taskNumber === "1"
        ? `To reach Band ${nextBand}: ${descriptorNext}\n\nKey fix: Add a clear overview paragraph (paragraph 2) summarising the 1-2 most significant trends — this is essential for Band 6+. Do NOT describe every data point.`
        : `To reach Band ${nextBand}: ${descriptorNext}\n\nKey fix: Ensure ALL parts of the question are addressed directly. Extend each main idea with a specific example or explanation. Add a clear concluding paragraph that restates your position.`,
    cc: `To reach Band ${nextBand}: ${descriptorNext}\n\nKey fix: Use a wider variety of cohesive devices — don't repeat "however" or "furthermore" more than once each. Ensure every paragraph has a clear topic sentence and that each sentence within it relates back to it.`,
    lr: `To reach Band ${nextBand}: ${descriptorNext}\n\nKey fix: Replace basic words with precise alternatives (e.g., "went up a lot" → "increased dramatically"; "bad" → "detrimental"). Learn and use collocations: "play a vital role", "a wide range of", "have a significant impact on".`,
    gra: `To reach Band ${nextBand}: ${descriptorNext}\n\nKey fix: Aim for 50%+ of sentences to be complex (containing subordinate clauses: "Although...", "which...", "because..."). Vary sentence openings — start some sentences with adverbial clauses or participle phrases.`,
  };

  return {
    score,
    label,
    wellDone: wellDones[criterion] || "Good effort on this criterion.",
    improvement: improvements[criterion] || `To reach Band ${nextBand}: ${descriptorNext}`,
    descriptorCurrent,
    descriptorNext,
  };
}

function generateTips(
  bands: BandScores,
  taskType: "academic" | "general",
  taskNumber: "1" | "2",
  currentWritingBand: string
): string[] {
  const tips: string[] = [];
  const curr = parseFloat(currentWritingBand || "0");

  if (bands.ta < 6.5) {
    tips.push(
      taskNumber === "1"
        ? "📊 Task 1 essential: Always write an overview (paragraph 2) summarising the 1-2 most significant trends before describing details. This single paragraph can raise your TA score by a full band."
        : "✍️ Task 2 essential: Underline EVERY part of the question before writing. Write a thesis statement in your introduction that directly responds to the exact question asked."
    );
  }

  if (bands.cc < 6.5) {
    tips.push("🔗 Cohesion tip: Use one cohesive device per paragraph minimum, but vary the type. Mix: contrast (however, nevertheless), addition (furthermore, in addition), result (consequently, therefore), and example (for instance, such as).");
  }

  if (bands.lr < 6.5) {
    tips.push("📚 Vocabulary tip: Learn 5 topic-specific collocations per common IELTS theme. Environment: 'carbon emissions', 'renewable energy', 'biodiversity loss'. Education: 'academic achievement', 'extracurricular activities'. Technology: 'artificial intelligence', 'digital literacy'.");
    tips.push("🔄 Paraphrase tip: Never repeat the same content word twice in one paragraph. Alternatives: increase → rise/surge/climb/grow; decrease → decline/fall/drop/plummet; important → significant/crucial/vital/essential.");
  }

  if (bands.gra < 6.5) {
    tips.push("📐 Grammar tip: Practise these 3 complex structures daily: (1) Relative clauses: 'Technology, which has transformed society, continues to evolve.' (2) Conditionals: 'If governments invested more in education, unemployment would decrease.' (3) Passive: 'It is widely believed that...'");
  }

  if (bands.overall >= 7 && bands.overall < 8) {
    tips.push("🚀 Band 8 gap: Your writing is strong. To push to Band 8: (1) Eliminate ALL grammatical errors — proofread for subject-verb agreement and article use. (2) Make every example specific with data or names. (3) Use sophisticated vocabulary like 'exacerbate', 'proliferate', 'notwithstanding'.");
  }

  if (curr > 0 && curr < bands.overall) {
    tips.push(`📈 Progress check: You scored Band ${bands.overall} today — that's ${(bands.overall - curr).toFixed(1)} above your current band of ${curr}. Keep practising under timed conditions (Task 1: 20 min, Task 2: 40 min).`);
  }

  tips.push(
    taskNumber === "1"
      ? "⏱️ Task 1 time plan: 4 min analyse chart + plan → 16 min write → 2 min check errors. Never exceed 20 minutes — Task 2 is worth double the marks."
      : "⏱️ Task 2 time plan: 5 min read + plan (bullet 3 arguments) → 30 min write → 5 min proofread. Aim for 280-320 words."
  );

  tips.push("🔁 Practice method: Write 3 essays per week. After each, compare against an official IELTS Band 7 sample answer for the same question. Identify 3 specific vocabulary or grammar differences and practise those features.");
  tips.push("⚠️ Disclaimer: This is a simulated AI examiner (not official IELTS). For accurate assessment, use Cambridge IELTS Official Practice Tests or a certified IELTS examiner.");

  return tips.slice(0, 7);
}

export function analyzeEssay(data: WizardData): AnalysisResult {
  const { essay, taskType, taskNumber, question, currentBands } = data;
  const words = essay.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const minWords = taskNumber === "1" ? 150 : 250;

  const taRaw = calculateTA(essay, wordCount, minWords, taskType, taskNumber, question);
  const ccRaw = calculateCC(essay);
  const lrRaw = calculateLR(essay);
  const graRaw = calculateGRA(essay);

  const ta = roundToHalfBand(taRaw);
  const cc = roundToHalfBand(ccRaw);
  const lr = roundToHalfBand(lrRaw);
  const gra = roundToHalfBand(graRaw);
  const overall = roundToHalfBand((ta + cc + lr + gra) / 4);

  const bands: BandScores = { ta, cc, lr, gra, overall };
  const taLabel = taskNumber === "1" ? "Task Achievement" : "Task Response";

  return {
    bands,
    feedback: {
      ta: generateCriterionFeedback("ta", ta, essay, taskType, taskNumber, taLabel),
      cc: generateCriterionFeedback("cc", cc, essay, taskType, taskNumber, "Coherence & Cohesion"),
      lr: generateCriterionFeedback("lr", lr, essay, taskType, taskNumber, "Lexical Resource"),
      gra: generateCriterionFeedback("gra", gra, essay, taskType, taskNumber, "Grammatical Range & Accuracy"),
    },
    tips: generateTips(bands, taskType, taskNumber, currentBands?.writing || "0"),
    wordCount,
    disclaimer: "⚠️ Simulated AI examiner — not an official IELTS result. Bands are indicative only.",
  };
}
