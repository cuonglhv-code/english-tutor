export interface WizardData {
  name: string;
  age: number;
  address: string;
  mobile: string;
  email: string;
  currentBands: {
    listening: string;
    reading: string;
    writing: string;
    speaking: string;
  };
  targetBand: string;
  taskType: "academic" | "general";
  taskNumber: "1" | "2";
  question: string;
  questionImage?: string; // base64 Data URL of uploaded image (display only, not sent to API)
  essay: string;
  language: "en" | "vi";
}

export interface BandScores {
  ta: number;
  cc: number;
  lr: number;
  gra: number;
  overall: number;
}

export interface CriterionFeedback {
  score: number;
  label: string;
  // Rule-based fields
  wellDone: string;
  improvement: string;
  descriptorCurrent: string;
  descriptorNext: string;
  // AI-only fields (optional)
  bandJustification?: string;
}

export interface AnalysisResult {
  bands: BandScores;
  feedback: {
    ta: CriterionFeedback;
    cc: CriterionFeedback;
    lr: CriterionFeedback;
    gra: CriterionFeedback;
  };
  tips: string[];
  wordCount: number;
  disclaimer: string;
  scoring_method?: "ai_examiner" | "rule_based_fallback";
  // AI-only extras (optional)
  overallComment?: string;
  priorityActions?: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  scoring_method?: "ai_examiner" | "rule_based_fallback";
}

// ─── Raw AI response shape from the Anthropic API ────────────────────────────

export interface AIRawCriterionFeedback {
  strengths: string;
  improvements: string;
  band_justification: string;
}

export interface AIRawFeedback {
  task_achievement: AIRawCriterionFeedback;
  coherence_cohesion: AIRawCriterionFeedback;
  lexical_resource: AIRawCriterionFeedback;
  grammatical_range_accuracy: AIRawCriterionFeedback;
  priority_actions: string[];
  overall_comment: string;
}

export interface AIRawResponse {
  task_achievement_band: number;
  coherence_cohesion_band: number;
  lexical_resource_band: number;
  grammatical_range_accuracy_band: number;
  overall_band: number;
  feedback: AIRawFeedback;
}

// ─── Essay Plan API ───────────────────────────────────────────────────────────

export interface EssayPlanRequest {
  task_type: "academic" | "general";
  task_number: "1" | "2";
  prompt_text: string;
  language: "en" | "vi";
}

export interface EssayPlanResponse {
  success: boolean;
  plan?: string;
  error?: string;
}

// ─── Supabase schema types ────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  // Onboarding fields (migration 002)
  age: number | null;
  city: string | null;
  phone: string | null;
  current_writing_band: string | null;
  target_writing_band: string | null;
  profile_completed: boolean;
}

export interface EssaySubmission {
  id: string;
  user_id: string | null;
  task_type: "task1" | "task2";
  prompt_text: string;
  essay_text: string;
  word_count: number;
  language: "en" | "vi";
  submitted_at: string;
  scoring_method: "ai_examiner" | "rule_based_fallback";
  // Essay plan fields (migration 002)
  essay_plan_requested: boolean;
  essay_plan_text: string | null;
}

export interface FeedbackResult {
  id: string;
  submission_id: string;
  overall_band: number;
  task_achievement_band: number;
  coherence_cohesion_band: number;
  lexical_resource_band: number;
  grammatical_range_accuracy_band: number;
  feedback_json: AIRawFeedback | Record<string, unknown>;
  generated_at: string;
}

export interface UserProgress {
  user_id: string;
  average_band: number;
  total_submissions: number;
  last_submission_at: string;
  average_per_criterion: {
    ta: number;
    cc: number;
    lr: number;
    gra: number;
  };
}

// ─── Dashboard types ──────────────────────────────────────────────────────────

export interface SubmissionWithFeedback extends EssaySubmission {
  feedback_results: FeedbackResult[];
}
