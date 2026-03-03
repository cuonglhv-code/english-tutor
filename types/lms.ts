// ─── LMS-specific TypeScript types ───────────────────────────────────────────
// Mirrors the tables created in supabase/migrations/002_lms_schema.sql

export interface UserGoals {
  id: string;
  user_id: string;
  // Target band scores (what the student wants to achieve)
  target_overall:   number | null;
  target_reading:   number | null;
  target_listening: number | null;
  target_writing:   number | null;
  target_speaking:  number | null;
  // Current band scores (manually reported by the student)
  current_overall:   number | null;
  current_reading:   number | null;
  current_listening: number | null;
  current_writing:   number | null;
  current_speaking:  number | null;
  updated_at: string;
}

export interface UserExamDate {
  id: string;
  user_id: string;
  exam_date: string | null; // ISO date string "YYYY-MM-DD"
  updated_at: string;
}

export interface ActivityLogRow {
  activity_date:  string; // "YYYY-MM-DD"
  skill:          "writing" | "reading" | "listening" | "speaking";
  exercises_done: number;
}

// Aggregated per-day shape used by the ActivityHeatmap component
export interface ActivityDay {
  date:   string;   // "YYYY-MM-DD"
  count:  number;   // total exercises done across all skills that day
  skills: string[]; // which skills were practiced
}

export interface Exercise {
  id:            string;
  title:         string;
  skill:         "writing" | "reading" | "listening" | "speaking";
  task_type:     "task1" | "task2" | "task1_builder" | null;
  question_type: string | null;
  source:        string | null;
  description:   string | null;
  body_text:     string | null;
  image_url:     string | null;
  is_published:  boolean;
  created_at:    string;
}

export type IeltsSkill = "writing" | "reading" | "listening" | "speaking";
