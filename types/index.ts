export interface WizardData {
  user_id?: string;
  taskType: "task1" | "task2" | "academic" | "general";
  questionImage?: string;
  questionText?: string;
  essay?: string;
  wordCount?: number;
  question?: string;
  question_id?: string;
  taskNumber?: "1" | "2";
  name?: string;
  email?: string;
  mobile?: string;
  language?: string;
  age?: string;
  address?: string;
  currentBands?: {
    listening?: string;
    reading?: string;
    writing?: string;
    speaking?: string;
  };
  targetBand?: string;
}

export interface EssayPlanRequest {
  essay: string;
  task_type: "task1" | "task2" | "academic" | "general";
  task_number?: "1" | "2";
  prompt_text?: string;
  language?: string;
}

export interface EssayPlanResponse {
  plan: string;
}

export interface CriterionFeedback {
  band?: number;
  score?: number;
  strengths?: string[];
  improvements?: string[];
  examples?: string[];
  label?: string;
  wellDone?: string;
  improvement?: string;
  descriptorCurrent?: string;
  descriptorNext?: string;
  bandJustification?: string;
  wellDone_vi?: string;
  improvement_vi?: string;
  bandJustification_vi?: string;
}

export interface AnalysisResult {
  taskType: "task1" | "task2";
  overallBand: number;
  bandScores: BandScores;
  feedback: {
    ta?: CriterionFeedback;
    cc?: CriterionFeedback;
    lr?: CriterionFeedback;
    gra?: CriterionFeedback;
    task_achievement?: CriterionFeedback;
    coherence_cohesion?: CriterionFeedback;
    lexical_resource?: CriterionFeedback;
    grammatical_range_accuracy?: CriterionFeedback;
  };
  executionTime?: number;
  _full_result?: unknown;
  bands?: BandScores;
  tips?: string[];
  tips_vi?: string[];
  wordCount?: number;
  disclaimer?: string;
  scoring_method?: string;
  overallComment?: string;
  overallComment_vi?: string;
  priorityActions?: string[];
  priorityActions_vi?: string[];
}

export interface BandScores {
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range_accuracy: number;
  ta?: number;
  cc?: number;
  lr?: number;
  gra?: number;
  overall?: number;
}

export interface SubmissionWithFeedback {
  id: string;
  user_id: string;
  task_type: "task1" | "task2";
  question_text: string;
  prompt_text?: string;
  question_image?: string;
  essay: string;
  essay_text?: string;
  word_count: number;
  overall_band: number;
  band_scores: BandScores;
  feedback_json: string;
  submitted_at: string;
  scoring_method?: string;
  language?: string;
  feedback_results?: Array<{
    id: string;
    submission_id: string;
    overall_band: number;
    task_achievement_band: number;
    coherence_cohesion_band: number;
    lexical_resource_band: number;
    grammatical_range_accuracy_band: number;
    feedback_json: unknown;
    generated_at: string;
  }>;
}

export interface UserProgress {
  total_submissions: number;
  average_band: number;
  last_submission_at: string;
  task1_count: number;
  task2_count: number;
  average_per_criterion?: number;
}

export interface Profile {
  id: string;
  display_name?: string;
  role?: string;
  profile_completed?: boolean;
  target_band?: number;
  target_writing_band?: string;
  exam_date?: string;
}

export interface AIRawCriterionFeedback {
  band: number;
  score: number;
  strengths: string[];
  improvements: string[];
  strengths_vi?: string[];
  improvements_vi?: string[];
  band_justification_vi?: string;
}

export interface AIRawFeedback {
  overall_band: number;
  band_scores: {
    task_achievement: number;
    coherence_cohesion: number;
    lexical_resource: number;
    grammatical_range_accuracy: number;
  };
  task_achievement: AIRawCriterionFeedback;
  coherence_cohesion: AIRawCriterionFeedback;
  lexical_resource: AIRawCriterionFeedback;
  grammatical_range_accuracy: AIRawCriterionFeedback;
  priority_actions?: string[];
  priority_actions_vi?: string[];
  overall_comment?: string;
  overall_comment_vi?: string;
}

export interface AIRawResponse {
  task_type: string;
  task_achievement_band: number;
  coherence_cohesion_band: number;
  lexical_resource_band: number;
  grammatical_range_accuracy_band: number;
  feedback: AIRawFeedback;
}