// ─── IELTS Raw Score → Band Conversion ────────────────────────────────────────
// Official IELTS band conversion tables (Academic).
// Each tuple: [minimumRawScore, band]. Sorted descending by raw score.

import type { EntryBandRange } from "./studyPlanConfig";

type BandTable = readonly [number, number][];

const READING_BAND_TABLE: BandTable = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [33, 7.5],
  [30, 7.0],
  [27, 6.5],
  [23, 6.0],
  [19, 5.5],
  [15, 5.0],
  [13, 4.5],
  [10, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [0, 2.0],
] as const;

const LISTENING_BAND_TABLE: BandTable = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [32, 7.5],
  [30, 7.0],
  [26, 6.5],
  [23, 6.0],
  [18, 5.5],
  [16, 5.0],
  [13, 4.5],
  [10, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [0, 2.0],
] as const;

/** Convert a raw section score to an IELTS band using the given table. */
export function rawScoreToBand(
  raw: number,
  section: "reading" | "listening"
): number {
  const table =
    section === "reading" ? READING_BAND_TABLE : LISTENING_BAND_TABLE;
  for (const [threshold, band] of table) {
    if (raw >= threshold) return band;
  }
  return 2.0;
}

/**
 * Round a numeric average to the nearest 0.5 increment (IELTS rounding rule).
 * e.g. 5.25 → 5.5, 5.1 → 5.0
 */
export function roundToHalfBand(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Estimate an entry band range from individual section bands.
 * Computes the unweighted average of the three sections.
 */
export function estimateEntryBandRange(
  readingBand: number,
  listeningBand: number,
  writingBand: number
): EntryBandRange {
  const avg = (readingBand + listeningBand + writingBand) / 3;
  if (avg <= 2.5) return "0-2.5";
  if (avg <= 3.5) return "2.5-3.5";
  if (avg <= 4.0) return "3.5-4.0";
  if (avg <= 4.5) return "4.0-4.5";
  if (avg <= 5.5) return "5.0-5.5";
  return "6.0-6.5";
}

/** Human-readable label for a band range used in UI */
export const ENTRY_BAND_RANGE_LABELS: Record<EntryBandRange, string> = {
  "0-2.5": "Band 0 – 2.5 (Beginner)",
  "2.5-3.5": "Band 2.5 – 3.5 (Elementary)",
  "3.5-4.0": "Band 3.5 – 4.0 (Pre-Intermediate)",
  "4.0-4.5": "Band 4.0 – 4.5 (Intermediate)",
  "5.0-5.5": "Band 5.0 – 5.5 (Upper-Intermediate)",
  "6.0-6.5": "Band 6.0 – 6.5 (Advanced)",
};
