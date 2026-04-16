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

// ── Bilingual section block ────────────────────────────────────────────────────
function BilingualBlock({
  icon,
  labelEn,
  labelVi,
  textEn,
  textVi,
  bgClass,
  textColorClass,
}: {
  icon: React.ReactNode;
  labelEn: string;
  labelVi: string;
  textEn: string;
  textVi?: string;
  bgClass: string;
  textColorClass: string;
}) {
  const hasVi = Boolean(textVi);
  return (
    <div className={`rounded-lg ${bgClass} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className={`font-semibold text-xs ${textColorClass}`}>
          {labelEn}
          {hasVi && (
            <span className="vi ml-2 font-normal opacity-75">/ {labelVi}</span>
          )}
        </p>
      </div>
      {hasVi ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* EN column */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">EN</p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{textEn}</p>
          </div>
          {/* VI column */}
          <div className="space-y-0.5 border-l pl-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">VI</p>
            <p className="text-sm leading-relaxed whitespace-pre-line vi">{textVi}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-line">{textEn}</p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function FeedbackAccordion({ feedback, lang }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-muted">
        <h2 className="font-bold text-lg">{t("results", "detailedFeedback", lang)}</h2>
        <p className="text-sm text-muted-foreground">{t("results", "feedbackDesc", lang)}</p>
        {/* Legend */}
        <p className="text-xs text-muted-foreground mt-1">
          Left: <strong>Feedback (English)</strong> ·  Right: <strong className="vi">Phản hồi (Tiếng Việt)</strong>
        </p>
      </div>
      <Accordion type="multiple" defaultValue={["ta", "cc"]} className="px-2">
        {KEYS.map((key) => {
          const item = feedback[key];
          if (!item) return null;
          const hasVi = Boolean(item.wellDone_vi);
          return (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 w-full pr-2">
                  <Badge
                    variant="outline"
                    className={`text-base font-bold min-w-[2.5rem] justify-center ${bandToColor(item.score ?? 0)}`}
                  >
                    {item.score ?? 0}
                  </Badge>
                  <span className="font-semibold text-left">{item.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  {/* Band descriptor (no VI equivalent — these are official EN descriptors) */}
                  <div className={`rounded-lg p-3 text-sm ${bandToBg(item.score ?? 0)}`}>
                    <p className="font-medium text-muted-foreground text-xs uppercase mb-1">
                      Band {item.score ?? 0} {lang === "vi" ? "Mô tả" : "Descriptor"}
                    </p>
                    <p>{item.descriptorCurrent}</p>
                  </div>

                  {/* What You Did Well */}
                  <BilingualBlock
                    icon={<CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                    labelEn={t("results", "wellDone", lang) as string}
                    labelVi="Điểm mạnh"
                    textEn={item.wellDone || ""}
                    textVi={item.wellDone_vi || ""}
                    bgClass="bg-green-50 dark:bg-green-900/20"
                    textColorClass="text-green-700 dark:text-green-400"
                  />

                  {/* How to Improve */}
                  <BilingualBlock
                    icon={<ArrowUpCircle className="h-4 w-4 text-jaxtina-blue shrink-0" />}
                    labelEn={t("results", "improve", lang) as string}
                    labelVi="Cách cải thiện"
                    textEn={item.improvement || ""}
                    textVi={item.improvement_vi || ""}
                    bgClass="bg-blue-50 dark:bg-blue-900/20"
                    textColorClass="text-jaxtina-blue"
                  />

                  {/* Band Justification */}
                  {item.bandJustification && (
                    <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">{t("results", "bandJustification", lang)}:</p>
                      {hasVi ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <p>{item.bandJustification}</p>
                          {item.bandJustification_vi && (
                            <p className="vi border-l pl-3">{item.bandJustification_vi}</p>
                          )}
                        </div>
                      ) : (
                        <p>{item.bandJustification}</p>
                      )}
                    </div>
                  )}

                  {/* Next band descriptor */}
                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <span className="font-medium">{t("results", "nextBand", lang)} </span>
                    {item.descriptorNext || ""}
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
