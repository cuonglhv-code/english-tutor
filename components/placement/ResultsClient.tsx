"use client";
// Client shell so StudyPlanSuggestion can use useLanguage()
import { StudyPlanSuggestion } from "./StudyPlanSuggestion";
import { useLanguage } from "@/hooks/useLanguage";
import type { EntryBandRange } from "@/lib/studyPlanConfig";

interface Props {
  testId: string;
  entryBandRange: EntryBandRange;
}

export function ResultsClient({ testId, entryBandRange }: Props) {
  const { lang } = useLanguage();
  return (
    <StudyPlanSuggestion
      lang={lang}
      testId={testId}
      entryBandRange={entryBandRange}
    />
  );
}
