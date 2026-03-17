// lib/tutor/types.ts

export type ProficiencyLevel =
  | 'Beginner'
  | 'Elementary'
  | 'Pre-Intermediate'
  | 'Intermediate'
  | 'Upper-Intermediate'
  | 'Advanced'

export type SkillArea =
  | 'Free Conversation'
  | 'Grammar Practice'
  | 'Vocabulary Building'
  | 'IELTS Writing'
  | 'IELTS Speaking'
  | 'Pronunciation'

// ── Message ────────────────────────────────────────────────────────────────────

export type MessageSender = 'user' | 'tutor'

export interface TutorMessage {
  id: string
  text: string
  sender: MessageSender
  vietnameseNote?: string
  timestamp: string // ISO string (serialisable for Supabase JSON)
}

// ── Feedback ───────────────────────────────────────────────────────────────────

export interface TutorFeedback {
  positive: string[]
  corrections: string[]
  suggestions: string[]
}

// ── API shapes ─────────────────────────────────────────────────────────────────

/** Body sent from the client to POST /api/tutor/chat */
export interface TutorChatRequest {
  message: string
  history: Pick<TutorMessage, 'sender' | 'text'>[]
  level: ProficiencyLevel
  skillArea: SkillArea
  language?: 'en' | 'vi'
}

/** JSON returned by the Claude call and forwarded to the client */
export interface TutorChatResponse {
  tutorResponse: string
  vietnameseNote: string
  feedback: TutorFeedback
  newVocabulary: string[]
  accuracyScore: number
}

// ── Favourites ─────────────────────────────────────────────────────────────────

export interface FavouritePrompt {
  text: string
  skill: SkillArea
  level: ProficiencyLevel
  savedAt: string // ISO string
}

// ── Session (Supabase row shape) ───────────────────────────────────────────────

export interface TutorSessionRow {
  id: string
  user_id: string
  level: ProficiencyLevel
  skill_area: SkillArea
  messages: TutorMessage[]
  favourite_prompts: FavouritePrompt[]
  created_at: string
  updated_at: string
}

// ── Learning goal ──────────────────────────────────────────────────────────────

export interface LearningGoal {
  id: number
  text: string
  completed: boolean
  progress: number // 0–100
}
