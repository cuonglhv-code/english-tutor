"use client";
// Client shell so StudyPlanSuggestion can use useLanguage()
import { StudyPlanSuggestion, type WritingSummary } from "./StudyPlanSuggestion";
import { useLanguage } from "@/hooks/useLanguage";
import type { EntryBandRange } from "@/lib/studyPlanConfig";

interface Props {
  testId: string;
  entryBandRange: EntryBandRange;
  readingBand: number;
  listeningBand: number;
  writingBand: number;
  overallAverage: number;
  writingSummary: WritingSummary | null;
}

export function ResultsClient({
  testId,
  entryBandRange,
  readingBand,
  listeningBand,
  writingBand,
  overallAverage,
  writingSummary,
}: Props) {
  const { lang } = useLanguage();
  return (
    <StudyPlanSuggestion
      lang={lang}
      testId={testId}
      entryBandRange={entryBandRange}
      readingBand={readingBand}
      listeningBand={listeningBand}
      writingBand={writingBand}
      overallAverage={overallAverage}
      writingSummary={writingSummary}
    />
  );
}
