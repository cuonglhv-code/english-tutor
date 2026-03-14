// ─── Study Plan Configuration ─────────────────────────────────────────────────
// Defines the 6-course catalogue and maps student entry band → course pathway.
// The old goal-band matrix has been replaced with a linear progression model.

// ── Types ─────────────────────────────────────────────────────────────────────

export type EntryBandRange =
  | "0-2.5"
  | "2.5-3.5"
  | "3.5-4.0"
  | "4.0-4.5"
  | "5.0-5.5"
  | "6.0-6.5";

// Kept for DB/API compatibility (stored in user_study_plans.goal_band)
export type GoalBand = string;

export interface PlanStage {
  name: string;
  months: number;
  sessions?: number;
  focus: string[];
}

export interface StudyPlanOption {
  planName: string;
  totalMonths: number;
  stages: PlanStage[];
}

// ── Course catalogue ──────────────────────────────────────────────────────────

export interface Course {
  key: string;
  name: string;
  /** e.g. "Band 1.0 – 2.5" */
  inputBandLabel: string;
  /** e.g. "Band 2.5" */
  outputBandLabel: string;
  months: number;
  sessions: number;
  description: string;
}

export const COURSES: Course[] = [
  {
    key: "foundation1",
    name: "Foundation 1",
    inputBandLabel: "Band 1.0 – 2.5",
    outputBandLabel: "Band 2.5",
    months: 2,
    sessions: 24,
    description:
      "Thiết lập nền móng tiếng Anh căn bản thông qua 20 chủ đề nền tảng thường gặp trong bài thi IELTS; chuẩn hóa ngữ âm và nắm vững các cấu trúc ngữ pháp - từ vựng sơ cấp.",
  },
  {
    key: "foundation2",
    name: "Foundation 2",
    inputBandLabel: "Band 2.5",
    outputBandLabel: "Band 3.5",
    months: 2,
    sessions: 24,
    description:
      "Thực hành chuyên sâu các chủ điểm ngữ pháp quan trọng cho IELTS; làm quen với kỹ năng Đọc - Nghe hiểu các văn bản ngắn và hình thành tư duy viết đoạn văn (Paragraph Writing).",
  },
  {
    key: "accelerator1",
    name: "IELTS Accelerator 1",
    inputBandLabel: "Band 3.5",
    outputBandLabel: "Band 4.5",
    months: 2,
    sessions: 24,
    description:
      "Chuyển tiếp từ tiếng Anh nền tảng sang tiếng Anh học thuật; tiếp cận và thực hành kỹ thuật làm bài cơ bản cho cả 4 kỹ năng.",
  },
  {
    key: "accelerator2",
    name: "IELTS Accelerator 2",
    inputBandLabel: "Band 4.5",
    outputBandLabel: "Band 5.5",
    months: 2,
    sessions: 24,
    description:
      "Nắm vững chiến thuật xử lý từng dạng bài (Question Types); thực hành sâu các kỹ năng khó như phân tích biểu đồ (Writing Task 1) và xây dựng bài luận (Writing Task 2).",
  },
  {
    key: "intensive",
    name: "IELTS Intensive",
    inputBandLabel: "Band 5.5",
    outputBandLabel: "Band 6.5+",
    months: 2,
    sessions: 24,
    description:
      "Thực hành chuyên sâu các chủ đề nâng cao; tập trung hoàn thiện năng lực ngôn ngữ và phát triển tư duy phản biện để bài nói/viết có chiều sâu.",
  },
  {
    key: "master",
    name: "IELTS Master",
    inputBandLabel: "Band 6.5+",
    outputBandLabel: "Band 7.0+",
    months: 2,
    sessions: 24,
    description:
      "Thực chiến giải đề cường độ cao dưới áp lực thời gian thật; phân tích lỗi sai hệ thống và cập nhật xu hướng ra đề mới nhất.",
  },
];

// ── Entry-band → starting course index ───────────────────────────────────────
// "0-2.5"   → Foundation 1  (index 0)
// "2.5-3.5" → Foundation 2  (index 1)
// "3.5-4.0" → Accelerator 1 (index 2)
// "4.0-4.5" → Accelerator 2 (index 3)
// "5.0-5.5" → Intensive      (index 4)
// "6.0-6.5" → Master         (index 5)

const ENTRY_START_IDX: Record<EntryBandRange, number> = {
  "0-2.5":   0,
  "2.5-3.5": 1,
  "3.5-4.0": 2,
  "4.0-4.5": 3,
  "5.0-5.5": 4,
  "6.0-6.5": 5,
};

/**
 * Return all courses the student should take, starting from their entry level,
 * in order through to IELTS Master.
 */
export function getCoursesFromEntry(entry: EntryBandRange): Course[] {
  return COURSES.slice(ENTRY_START_IDX[entry] ?? 0);
}

/**
 * Convert a Course array into a StudyPlanOption for saving to user_study_plans.
 */
export function coursesToPlan(courses: Course[]): StudyPlanOption {
  return {
    planName: courses.map((c) => c.name).join(" → "),
    totalMonths: courses.reduce((sum, c) => sum + c.months, 0),
    stages: courses.map((c) => ({
      name: c.name,
      months: c.months,
      sessions: c.sessions,
      focus: [c.description],
    })),
  };
}

// ── Legacy helpers (kept for any external references) ─────────────────────────
export const ENTRY_BAND_RANGES: EntryBandRange[] = [
  "0-2.5",
  "2.5-3.5",
  "3.5-4.0",
  "4.0-4.5",
  "5.0-5.5",
  "6.0-6.5",
];
