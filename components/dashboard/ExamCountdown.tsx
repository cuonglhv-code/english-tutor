"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateExamDateAction } from "@/lib/actions/lms";
import type { UserExamDate } from "@/types/lms";
import type { Lang } from "@/lib/i18n";

interface Props {
  examDate:  UserExamDate | null;
  lang:      Lang;
  onUpdate:  (updated: UserExamDate) => void;
}

function getDaysRemaining(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const exam  = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((exam.getTime() - today.getTime()) / 86_400_000);
}

function countdownColor(days: number): string {
  if (days <= 0)  return "text-muted-foreground";
  if (days <= 7)  return "text-jaxtina-red";
  if (days <= 30) return "text-orange-500";
  return "text-jaxtina-blue";
}

function formatExamDate(dateStr: string, lang: Lang): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(
    lang === "vi" ? "vi-VN" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

export function ExamCountdown({ examDate, lang, onUpdate }: Props) {
  const [editing,   setEditing]   = useState(false);
  const [dateInput, setDateInput] = useState(examDate?.exam_date ?? "");
  const [isPending, startTransition] = useTransition();

  const days = getDaysRemaining(examDate?.exam_date);

  const todayStr = new Date().toISOString().split("T")[0];

  function handleSave() {
    if (!dateInput) return;
    startTransition(async () => {
      const result = await updateExamDateAction(dateInput);
      if (result.error) {
        toast.error(
          lang === "vi" ? "Lỗi lưu ngày thi" : "Failed to save exam date"
        );
      } else {
        // Merge with existing row (or create a shell if none existed)
        onUpdate({
          id:         examDate?.id ?? "",
          user_id:    examDate?.user_id ?? "",
          exam_date:  dateInput,
          updated_at: new Date().toISOString(),
        });
        setEditing(false);
        toast.success(
          lang === "vi" ? "Đã lưu ngày thi!" : "Exam date saved!"
        );
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-6 text-center">
      <CalendarDays className="h-7 w-7 text-jaxtina-red" />

      {days !== null ? (
        <>
          <p className={`text-6xl font-black leading-none tabular-nums ${countdownColor(days)}`}>
            {days > 0 ? days : 0}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "vi" ? "ngày còn lại" : "days remaining"}
          </p>
          {examDate?.exam_date && (
            <p className="text-xs text-muted-foreground">
              {formatExamDate(examDate.exam_date, lang)}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground px-4">
          {lang === "vi"
            ? "Chưa đặt ngày thi"
            : "No exam date set"}
        </p>
      )}

      {editing ? (
        <div className="flex items-center gap-1 mt-1">
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="h-8 text-xs w-36"
            min={todayStr}
            disabled={isPending}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600"
            onClick={handleSave}
            disabled={isPending || !dateInput}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              setEditing(false);
              setDateInput(examDate?.exam_date ?? "");
            }}
            disabled={isPending}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-1 h-7 text-xs gap-1"
          onClick={() => {
            setDateInput(examDate?.exam_date ?? "");
            setEditing(true);
          }}
        >
          <Pencil className="h-3 w-3" />
          {lang === "vi" ? "Cập nhật ngày thi" : "Set exam date"}
        </Button>
      )}
    </div>
  );
}
