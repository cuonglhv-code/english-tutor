export interface UserGoals {
  id: string;
  user_id: string;
  target_band: number;
  current_band: number;
  weekly_hours: number;
  practice_writing: number;
  practice_speaking: number;
  current_reading?: number;
  current_listening?: number;
  current_writing?: number;
  current_speaking?: number;
  target_reading?: number;
  target_listening?: number;
  target_writing?: number;
  target_speaking?: number;
  created_at: string;
  updated_at: string;
}

export interface UserExamDate {
  id: string;
  user_id: string;
  exam_date: string;
  days_remaining: number;
  created_at: string;
  updated_at?: string;
}

export interface ActivityDay {
  date: string;
  count: number;
  skills: string[];
  minutes?: number;
}

export interface ActivityLogRow {
  activity_date: string;
  skill: string;
  exercises_done: number;
}

export interface EngagementEvent {
  event_name: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}