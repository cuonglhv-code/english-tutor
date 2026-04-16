// lib/supabase/lms.ts
// Supabase helpers for LMS tables (goals, exam dates, activity log).
//
// This codebase's LMS schema is defined in:
// - supabase/migrations/002_lms_schema.sql (+ later adjustments)

import { createClient, createServiceClient } from "@/lib/supabase-server";
import type { ActivityLogRow, UserExamDate, UserGoals } from "@/types/lms";

export async function getUserGoals(userId: string): Promise<UserGoals | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserGoals | null) ?? null;
}

export async function upsertUserGoals(
  userId: string,
  goals: Partial<Omit<UserGoals, "id" | "user_id" | "updated_at">>
): Promise<UserGoals> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_goals")
    .upsert(
      {
        ...goals,
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as UserGoals;
}

export async function getUserExamDate(userId: string): Promise<UserExamDate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_exam_dates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserExamDate | null) ?? null;
}

export async function upsertUserExamDate(
  userId: string,
  examDate: string | null
): Promise<UserExamDate> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_exam_dates")
    .upsert(
      {
        user_id: userId,
        exam_date: examDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as UserExamDate;
}

export async function logUserActivity(row: {
  userId: string;
  activityDate?: string; // "YYYY-MM-DD" (defaults to today)
  skill: ActivityLogRow["skill"];
  exercisesDone?: number;
  minutesSpent?: number;
}): Promise<void> {
  const supabase = createServiceClient();
  const {
    userId,
    activityDate,
    skill,
    exercisesDone = 1,
    minutesSpent = 0,
  } = row;

  const payload: Record<string, unknown> = {
    user_id: userId,
    activity_date: activityDate ?? new Date().toISOString().slice(0, 10),
    skill,
    exercises_done: exercisesDone,
  };

  // minutes_spent exists in the 002 migration; include it opportunistically.
  if (minutesSpent != null) payload.minutes_spent = minutesSpent;

  const { error } = await supabase.from("user_activity_log").upsert(payload, {
    onConflict: "user_id,activity_date,skill",
  });

  // Non-throwing — activity logging should never break main flows
  if (error) console.warn("[logUserActivity] failed:", error.message);
}

