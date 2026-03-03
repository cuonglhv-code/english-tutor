"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, AlertCircle, AlignLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { CsvRow } from "@/lib/readCsv";
import { viTranslations } from "@/lib/translations";

// ─── i18n strings ─────────────────────────────────────────────────────────────

const labels = {
  pageTitle: { en: "Writing 101", vi: "Writing 101" },
  subtitle: { en: "IELTS Writing reference guide — structures, tips, and common mistakes.", vi: "Tài liệu tham khảo Writing IELTS — cấu trúc, mẹo viết và lỗi thường gặp." },
  tab1: { en: "Task 1 — Academic Report", vi: "Báo cáo học thuật" },
  tab2: { en: "Task 2 — Essay", vi: "Bài luận" },
  colType: { en: "Question Type", vi: "Loại câu hỏi" },
  colStructure: { en: "Standard Structure", vi: "Cấu trúc chuẩn" },
  colTips: { en: "Tips for Band 7+", vi: "Chiến lược đạt Band 7+" },
  colMistakes: { en: "Common Mistakes", vi: "Lỗi thường gặp" },
  expandAll: { en: "Expand all", vi: "Mở rộng tất cả" },
  collapseAll: { en: "Collapse all", vi: "Thu gọn tất cả" },
};

function L(key: keyof typeof labels): React.ReactNode {
  if (labels[key].en === labels[key].vi) {
    return labels[key].en;
  }
  return (
    <>
      {labels[key].en} / <em className="vi" lang="vi">{labels[key].vi}</em>
    </>
  );
}

// ─── Section block inside an accordion item ───────────────────────────────────

function Section({
  icon,
  heading,
  text,
  className = "",
}: {
  icon: React.ReactNode;
  heading: React.ReactNode;
  text: string;
  className?: string;
}) {
  const viText = viTranslations[text] || text;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {heading}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line mt-1">
        {text}
        {viText !== text && (
          <>
            <br />
            <br />
            <span className="vi" lang="vi">
              {viText}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

// ─── Single task table rendered as accordion ──────────────────────────────────

function TaskAccordion({
  rows,
  openItems,
  setOpenItems,
}: {
  rows: CsvRow[];
  openItems: string[];
  setOpenItems: (v: string[]) => void;
}) {
  return (
    <Accordion
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className="w-full"
    >
      {rows.map((row, idx) => {
        const itemId = `row-${idx}`;
        const viTitle = viTranslations[row.questionType] || row.questionType;
        return (
          <AccordionItem key={itemId} value={itemId} className="border rounded-xl mb-3 px-4 last:mb-0">
            <AccordionTrigger className="hover:no-underline py-3 text-left">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[11px] bg-jaxtina-red/10 text-jaxtina-red border-jaxtina-red/20 hover:bg-jaxtina-red/10"
                >
                  {idx + 1}
                </Badge>
                <span className="font-semibold text-sm">
                  {row.questionType}{" "}
                  {viTitle !== row.questionType && (
                    <span className="font-normal">/ <em className="vi" lang="vi">{viTitle}</em></span>
                  )}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <div className="grid gap-5 sm:grid-cols-3 border-t pt-4">
                <Section
                  icon={<AlignLeft className="h-3.5 w-3.5 text-jaxtina-blue" />}
                  heading={L("colStructure")}
                  text={row.structure}
                />
                <Section
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                  heading={L("colTips")}
                  text={row.tips}
                />
                <Section
                  icon={<AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                  heading={L("colMistakes")}
                  text={row.mistakes}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

// ─── Main page client component ───────────────────────────────────────────────

interface Props {
  task1: CsvRow[];
  task2: CsvRow[];
}

export function Writing101Client({ task1, task2 }: Props) {
  const [activeTab, setActiveTab] = useState<"task1" | "task2">("task1");

  const rows = activeTab === "task1" ? task1 : task2;
  const allIds = rows.map((_, i) => `row-${i}`);

  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleAll = () => {
    setOpenItems(openItems.length === allIds.length ? [] : allIds);
  };

  const switchTab = (tab: "task1" | "task2") => {
    setActiveTab(tab);
    setOpenItems([]);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-jaxtina-red" />
          <h1 className="text-2xl font-black tracking-tight">{L("pageTitle")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{L("subtitle")}</p>
        <p className="text-xs text-muted-foreground pt-1 bg-muted/50 p-2 rounded-md inline-block mt-2">
          EN = English | VI = Tiếng Việt. English comes first, Vietnamese follows in italics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["task1", "task2"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors border ${activeTab === tab
                ? "bg-jaxtina-red text-white border-jaxtina-red"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
              }`}
          >
            {tab === "task1" ? L("tab1") : L("tab2")}
          </button>
        ))}

        <button
          onClick={toggleAll}
          className="ml-auto rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground border border-border hover:bg-muted transition-colors"
        >
          {openItems.length === allIds.length ? L("collapseAll") : L("expandAll")}
        </button>
      </div>

      {/* Accordion list */}
      <TaskAccordion
        rows={rows}
        openItems={openItems}
        setOpenItems={setOpenItems}
      />
    </div>
  );
}
