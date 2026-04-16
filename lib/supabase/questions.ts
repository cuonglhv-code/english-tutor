import { createServiceClient } from "@/lib/supabase-server";

export type DbQuestionRow = {
  id: string;
  title: string | null;
  task_type: "task1" | "task2" | string;
  question_type: string | null;
  body_text: string | null;
  image_url: string | null;
  visual_description: string | null;
  visual_description_json: unknown | null;
  is_published: boolean;
  created_at?: string;
};

export async function listPublishedQuestions(): Promise<DbQuestionRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbQuestionRow[];
}

export async function adminListQuestions(filters: {
  taskType?: string;
  questionTypeContains?: string;
}): Promise<DbQuestionRow[]> {
  const supabase = createServiceClient();
  let q = supabase.from("questions").select("*").order("created_at", { ascending: false });
  if (filters.taskType) q = q.eq("task_type", filters.taskType);
  if (filters.questionTypeContains) q = q.ilike("question_type", `%${filters.questionTypeContains}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DbQuestionRow[];
}

export async function adminCreateQuestion(
  input: Partial<DbQuestionRow> & { title: string; task_type: string }
): Promise<DbQuestionRow> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("questions")
    .insert({
      title: input.title,
      task_type: input.task_type,
      question_type: input.question_type ?? null,
      body_text: input.body_text ?? null,
      image_url: input.image_url ?? null,
      visual_description: input.visual_description ?? null,
      visual_description_json: input.visual_description_json ?? null,
      is_published: input.is_published ?? true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as DbQuestionRow;
}

export async function adminUpdateQuestion(
  id: string,
  updates: Record<string, unknown>
): Promise<DbQuestionRow> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as DbQuestionRow;
}

export async function adminDeleteQuestion(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}

