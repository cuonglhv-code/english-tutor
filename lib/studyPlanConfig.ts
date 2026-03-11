// ─── Study Plan Configuration ─────────────────────────────────────────────────
// Maps (entry band range × goal band) → recommended study programme.
// Used by the Placement Test results page to auto-suggest a learning path.

export type EntryBandRange =
  | "0-2.5"
  | "2.5-3.5"
  | "3.5-4.0"
  | "4.0-4.5"
  | "5.0-5.5"
  | "6.0-6.5";

export type GoalBand = "4.0-4.5" | "5.0+" | "6.0+" | "7.0+";

export interface PlanStage {
  name: string;
  months: number;
  focus: string[];
}

export interface StudyPlanOption {
  planName: string;
  totalMonths: number;
  stages: PlanStage[];
}

export const ENTRY_BAND_RANGES: EntryBandRange[] = [
  "0-2.5",
  "2.5-3.5",
  "3.5-4.0",
  "4.0-4.5",
  "5.0-5.5",
  "6.0-6.5",
];

export const GOAL_BANDS: GoalBand[] = ["4.0-4.5", "5.0+", "6.0+", "7.0+"];

export const STUDY_PLAN_CONFIG: Record<
  EntryBandRange,
  Partial<Record<GoalBand, StudyPlanOption>>
> = {
  // ── Entry: 0 – 2.5 ────────────────────────────────────────────────────────
  "0-2.5": {
    "4.0-4.5": {
      planName: "IELTS Basic → Foundation",
      totalMonths: 6,
      stages: [
        {
          name: "IELTS Basic",
          months: 3,
          focus: [
            "English grammar fundamentals",
            "500 core IELTS vocabulary items",
            "Exam format & question types overview",
          ],
        },
        {
          name: "Foundation 1",
          months: 3,
          focus: [
            "Reading skimming & scanning",
            "Listening form-filling & note-taking",
            "Writing Task 1 basics (describing visuals)",
          ],
        },
      ],
    },
    "5.0+": {
      planName: "IELTS Basic → Foundation → Booster",
      totalMonths: 9,
      stages: [
        {
          name: "IELTS Basic",
          months: 2,
          focus: ["Grammar foundations", "Core vocabulary & pronunciation"],
        },
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Reading strategies", "Task 1 report writing"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: [
            "Listening detail questions",
            "Task 2 essay structure",
          ],
        },
        {
          name: "Booster 1",
          months: 3,
          focus: [
            "Timed full-paper practice",
            "Band 5 gap analysis & targeted improvement",
          ],
        },
      ],
    },
    "6.0+": {
      planName: "IELTS Basic → Full Achiever Pathway",
      totalMonths: 14,
      stages: [
        {
          name: "IELTS Basic",
          months: 2,
          focus: ["Grammar & vocabulary foundations"],
        },
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Core reading & listening skills"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: ["Reading + Listening full sections"],
        },
        {
          name: "Booster 1",
          months: 2,
          focus: ["Writing accuracy & cohesion"],
        },
        {
          name: "Booster 2",
          months: 3,
          focus: ["Full timed papers & mock exams"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6 consolidation & exam technique"],
        },
      ],
    },
    "7.0+": {
      planName: "IELTS Basic → Full Achiever Extended",
      totalMonths: 18,
      stages: [
        {
          name: "IELTS Basic",
          months: 2,
          focus: ["Grammar & vocabulary foundations"],
        },
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Core reading & listening skills"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: ["Writing Task 1 & 2 structure"],
        },
        {
          name: "Booster 1",
          months: 2,
          focus: ["Fluency & accuracy at Band 5"],
        },
        {
          name: "Booster 2",
          months: 3,
          focus: ["Timed mock papers & error analysis"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6.5 writing precision & lexical range"],
        },
        {
          name: "Achiever 2",
          months: 4,
          focus: ["Band 7 mock exams & examiner-level feedback"],
        },
      ],
    },
  },

  // ── Entry: 2.5 – 3.5 ──────────────────────────────────────────────────────
  "2.5-3.5": {
    "4.0-4.5": {
      planName: "Foundation Programme",
      totalMonths: 4,
      stages: [
        {
          name: "Foundation 1",
          months: 2,
          focus: [
            "Reading paragraph flow & True/False/NG",
            "Listening note-taking & short-answer",
          ],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: [
            "Task 1 report writing (charts & maps)",
            "Task 2 opinion essay structure",
          ],
        },
      ],
    },
    "5.0+": {
      planName: "Foundation → Booster",
      totalMonths: 7,
      stages: [
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Core reading & listening skills"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: ["Writing both tasks with accuracy"],
        },
        {
          name: "Booster 1",
          months: 3,
          focus: ["Exam technique", "Timed practice under exam conditions"],
        },
      ],
    },
    "6.0+": {
      planName: "Foundation → Booster → Achiever",
      totalMonths: 11,
      stages: [
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Core reading & listening skills"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: ["Writing structure & cohesion"],
        },
        {
          name: "Booster 1",
          months: 2,
          focus: ["Timed paper practice & weak-area targeting"],
        },
        {
          name: "Booster 2",
          months: 2,
          focus: ["Error pattern analysis & vocabulary expansion"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6 mock exams & detailed feedback"],
        },
      ],
    },
    "7.0+": {
      planName: "Foundation → Full Achiever",
      totalMonths: 14,
      stages: [
        {
          name: "Foundation 1",
          months: 2,
          focus: ["Core skills"],
        },
        {
          name: "Foundation 2",
          months: 2,
          focus: ["Writing both tasks"],
        },
        {
          name: "Booster 1",
          months: 2,
          focus: ["Timed practice"],
        },
        {
          name: "Booster 2",
          months: 2,
          focus: ["Academic writing depth & error analysis"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6.5 precision"],
        },
        {
          name: "Achiever 2",
          months: 3,
          focus: ["Band 7 mock exams & final polish"],
        },
      ],
    },
  },

  // ── Entry: 3.5 – 4.0 ──────────────────────────────────────────────────────
  "3.5-4.0": {
    "4.0-4.5": {
      planName: "Booster Sprint",
      totalMonths: 3,
      stages: [
        {
          name: "Booster 1",
          months: 3,
          focus: [
            "IELTS exam strategy & technique",
            "Band 4.5 gap analysis",
            "Writing task scoring criteria",
          ],
        },
      ],
    },
    "5.0+": {
      planName: "Booster 1 + 2",
      totalMonths: 6,
      stages: [
        {
          name: "Booster 1",
          months: 3,
          focus: ["Accuracy improvement & fluency building"],
        },
        {
          name: "Booster 2",
          months: 3,
          focus: ["Timed full-paper practice & score consolidation"],
        },
      ],
    },
    "6.0+": {
      planName: "Booster → Achiever",
      totalMonths: 9,
      stages: [
        {
          name: "Booster 1",
          months: 3,
          focus: ["Band 5 reading, listening & writing strategies"],
        },
        {
          name: "Booster 2",
          months: 3,
          focus: ["Error pattern identification & vocabulary range"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6 consolidation with mock tests"],
        },
      ],
    },
    "7.0+": {
      planName: "Booster → Full Achiever",
      totalMonths: 12,
      stages: [
        {
          name: "Booster 1",
          months: 2,
          focus: ["Gap analysis & targeted Band 5 improvement"],
        },
        {
          name: "Booster 2",
          months: 3,
          focus: ["Academic writing depth & complex grammar"],
        },
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6.5 writing precision & reading speed"],
        },
        {
          name: "Achiever 2",
          months: 4,
          focus: ["Band 7 mock exams & examiner-level feedback"],
        },
      ],
    },
  },

  // ── Entry: 4.0 – 4.5 ──────────────────────────────────────────────────────
  "4.0-4.5": {
    "5.0+": {
      planName: "Booster 2 Focus",
      totalMonths: 4,
      stages: [
        {
          name: "Booster 2",
          months: 4,
          focus: [
            "Band 5 skill consolidation",
            "Full timed papers",
            "Writing lexical resource improvement",
          ],
        },
      ],
    },
    "6.0+": {
      planName: "Booster 2 → Achiever 1",
      totalMonths: 7,
      stages: [
        {
          name: "Booster 2",
          months: 3,
          focus: ["Writing accuracy & lexical range"],
        },
        {
          name: "Achiever 1",
          months: 4,
          focus: ["Band 6 mock tests & examiner feedback"],
        },
      ],
    },
    "7.0+": {
      planName: "Achiever Programme",
      totalMonths: 10,
      stages: [
        {
          name: "Booster 2",
          months: 2,
          focus: ["Band 5 consolidation"],
        },
        {
          name: "Achiever 1",
          months: 4,
          focus: [
            "Complex grammar structures",
            "Academic vocabulary depth",
            "Band 6.5 reading & listening",
          ],
        },
        {
          name: "Achiever 2",
          months: 4,
          focus: ["Band 7 exam papers & precision feedback"],
        },
      ],
    },
  },

  // ── Entry: 5.0 – 5.5 ──────────────────────────────────────────────────────
  "5.0-5.5": {
    "6.0+": {
      planName: "Achiever 1",
      totalMonths: 4,
      stages: [
        {
          name: "Achiever 1",
          months: 4,
          focus: [
            "Band 6 gap-fill analysis",
            "Coherence & cohesion in writing",
            "Less-common vocabulary in context",
          ],
        },
      ],
    },
    "7.0+": {
      planName: "Achiever 1 + 2",
      totalMonths: 7,
      stages: [
        {
          name: "Achiever 1",
          months: 3,
          focus: ["Band 6 consolidation & error reduction"],
        },
        {
          name: "Achiever 2",
          months: 4,
          focus: ["Band 7 exam practice & idiomatic language"],
        },
      ],
    },
  },

  // ── Entry: 6.0 – 6.5 ──────────────────────────────────────────────────────
  "6.0-6.5": {
    "7.0+": {
      planName: "Achiever 2 Sprint",
      totalMonths: 4,
      stages: [
        {
          name: "Achiever 2",
          months: 4,
          focus: [
            "Band 7 precision writing & paraphrase",
            "Error-free complex sentence control",
            "Advanced reading speed & inference",
          ],
        },
      ],
    },
  },
};

/** Returns valid goal bands for a given entry range (excludes goals below entry) */
export function getAvailableGoals(entry: EntryBandRange): GoalBand[] {
  return GOAL_BANDS.filter((g) => STUDY_PLAN_CONFIG[entry]?.[g] !== undefined);
}
