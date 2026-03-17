import { createServiceClient } from "@/lib/supabase-server";

export type SubmissionWithFeedback = {
  id: string;
  user_id: string | null;
  task_type: string;
  prompt_text: string;
  essay_text: string;
  word_count: number;
  language: string;
  submitted_at: string;
  scoring_method: string;
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
};

export async function getUserSubmissions(userId: string): Promise<SubmissionWithFeedback[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("essay_submissions")
    .select("*, feedback_results(*)")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SubmissionWithFeedback[];
}

export async function getSubmissionById(id: string): Promise<SubmissionWithFeedback | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("essay_submissions")
    .select("*, feedback_results(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as SubmissionWithFeedback | null) ?? null;
}

