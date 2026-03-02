"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowUpCircle } from "lucide-react";
import { bandToColor, bandToBg } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  feedback: AnalysisResult["feedback"];
  lang: Lang;
}

const KEYS = ["ta", "cc", "lr", "gra"] as const;

export function FeedbackAccordion({ feedback, lang }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-muted">
        <h2 className="font-bold text-lg">{t("results", "detailedFeedback", lang)}</h2>
        <p className="text-sm text-muted-foreground">{t("results", "feedbackDesc", lang)}</p>
      </div>
      <Accordion type="multiple" defaultValue={["ta", "cc"]} className="px-2">
        {KEYS.map((key) => {
          const item = feedback[key];
          return (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 w-full pr-2">
                  <Badge
                    variant="outline"
                    className={`text-base font-bold min-w-[2.5rem] justify-center ${bandToColor(item.score)}`}
                  >
                    {item.score}
                  </Badge>
                  <span className="font-semibold text-left">{item.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <div className={`rounded-lg p-3 text-sm ${bandToBg(item.score)}`}>
                    <p className="font-medium text-muted-foreground text-xs uppercase mb-1">
                      Band {item.score} {lang === "vi" ? "Mô tả" : "Descriptor"}
                    </p>
                    <p>{item.descriptorCurrent}</p>
                  </div>

                  <div className="flex gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-green-700 dark:text-green-400 mb-0.5">
                        {t("results", "wellDone", lang)}
                      </p>
                      <p className="text-sm">{item.wellDone}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                    <ArrowUpCircle className="h-4 w-4 text-jaxtina-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-jaxtina-blue mb-0.5">
                        {t("results", "improve", lang)}
                      </p>
                      <p className="text-sm whitespace-pre-line">{item.improvement}</p>
                    </div>
                  </div>

                  {item.bandJustification && (
                    <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                      <span className="font-medium">{t("results", "bandJustification", lang)}: </span>
                      {item.bandJustification}
                    </div>
                  )}

                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <span className="font-medium">{t("results", "nextBand", lang)} </span>
                    {item.descriptorNext}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
