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
import { useLanguage } from "@/hooks/useLanguage";
import type { CsvRow } from "@/lib/readCsv";

// ─── i18n strings ─────────────────────────────────────────────────────────────

const labels = {
  pageTitle:    { en: "Writing 101",                                            vi: "Writing 101" },
  subtitle:     { en: "IELTS Writing reference guide — structures, tips, and common mistakes.", vi: "Tài liệu tham khảo Writing IELTS — cấu trúc, mẹo viết và lỗi thường gặp." },
  tab1:         { en: "Task 1 — Academic Report",                               vi: "Task 1 — Báo cáo học thuật" },
  tab2:         { en: "Task 2 — Essay",                                         vi: "Task 2 — Bài luận" },
  colType:      { en: "Question Type",                                          vi: "Loại câu hỏi" },
  colStructure: { en: "Standard Structure",                                     vi: "Cấu trúc chuẩn" },
  colTips:      { en: "Tips for Band 7+",                                       vi: "Mẹo đạt Band 7+" },
  colMistakes:  { en: "Common Mistakes",                                        vi: "Lỗi thường gặp" },
  expandAll:    { en: "Expand all",                                             vi: "Mở rộng tất cả" },
  collapseAll:  { en: "Collapse all",                                           vi: "Thu gọn tất cả" },
};

function L(key: keyof typeof labels, lang: "en" | "vi"): string {
  return labels[key][lang];
}

// ─── Section block inside an accordion item ───────────────────────────────────

function Section({
  icon,
  heading,
  text,
  className = "",
}: {
  icon: React.ReactNode;
  heading: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {heading}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{text}</p>
    </div>
  );
}

// ─── Single task table rendered as accordion ──────────────────────────────────

function TaskAccordion({
  rows,
  lang,
  openItems,
  setOpenItems,
}: {
  rows: CsvRow[];
  lang: "en" | "vi";
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
        return (
          <AccordionItem key={itemId} value={itemId} className="border rounded-xl mb-3 px-4 last:mb-0">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 text-left">
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[11px] bg-jaxtina-red/10 text-jaxtina-red border-jaxtina-red/20 hover:bg-jaxtina-red/10"
                >
                  {idx + 1}
                </Badge>
                <span className="font-semibold text-sm">{row.questionType}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <div className="grid gap-5 sm:grid-cols-3 border-t pt-4">
                <Section
                  icon={<AlignLeft className="h-3.5 w-3.5 text-jaxtina-blue" />}
                  heading={L("colStructure", lang)}
                  text={row.structure}
                />
                <Section
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                  heading={L("colTips", lang)}
                  text={row.tips}
                />
                <Section
                  icon={<AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                  heading={L("colMistakes", lang)}
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
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"task1" | "task2">("task1");

  const rows = activeTab === "task1" ? task1 : task2;
  const allIds = rows.map((_, i) => `row-${i}`);

  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleAll = () => {
    setOpenItems(openItems.length === allIds.length ? [] : allIds);
  };

  // Reset open items when switching tabs
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
          <h1 className="text-2xl font-black tracking-tight">{L("pageTitle", lang)}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{L("subtitle", lang)}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["task1", "task2"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors border ${
              activeTab === tab
                ? "bg-jaxtina-red text-white border-jaxtina-red"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "task1" ? L("tab1", lang) : L("tab2", lang)}
          </button>
        ))}

        <button
          onClick={toggleAll}
          className="ml-auto rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground border border-border hover:bg-muted transition-colors"
        >
          {openItems.length === allIds.length ? L("collapseAll", lang) : L("expandAll", lang)}
        </button>
      </div>

      {/* Accordion list */}
      <TaskAccordion
        rows={rows}
        lang={lang}
        openItems={openItems}
        setOpenItems={setOpenItems}
      />
    </div>
  );
}
