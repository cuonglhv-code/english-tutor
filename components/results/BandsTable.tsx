"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { bandToColor, bandToBg } from "@/lib/utils";
import type { BandScores } from "@/types";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  bands: BandScores;
  taskNumber: "1" | "2";
  lang: Lang;
}

const CRITERIA = [
  { key: "ta" as const, label: "Task Achievement / Response" },
  { key: "cc" as const, label: "Coherence and Cohesion" },
  { key: "lr" as const, label: "Lexical Resource" },
  { key: "gra" as const, label: "Grammatical Range and Accuracy" },
];

function BandBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            score >= 7 ? "bg-jaxtina-blue" : score >= 6 ? "bg-yellow-500" : "bg-jaxtina-red"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 9) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function BandsTable({ bands, taskNumber, lang }: Props) {
  const levelLabel =
    bands.overall >= 8 ? t("results", "expertUser", lang) :
    bands.overall >= 7 ? t("results", "goodUser", lang) :
    bands.overall >= 6 ? t("results", "competentUser", lang) :
    bands.overall >= 5 ? t("results", "modestUser", lang) : t("results", "limitedUser", lang);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-jaxtina-red to-jaxtina-blue p-6 text-white text-center">
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">{t("results", "overallBand", lang)}</p>
        <div className="text-5xl sm:text-7xl font-black mt-2 mb-1">{bands.overall}</div>
        <p className="text-xs sm:text-sm opacity-70 mt-1">{levelLabel}</p>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left p-3 font-semibold">
                {lang === "vi" ? "Tiêu chí" : "Criterion"}
              </th>
              <th className="text-center p-3 font-semibold">Band</th>
              <th className="p-3 hidden sm:table-cell">
                {lang === "vi" ? "Tiến độ" : "Progress"}
              </th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map(({ key, label }, i) => {
              const score = bands[key];
              return (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className={`border-t transition-colors hover:bg-muted/40 ${bandToBg(score)}`}
                >
                  <td className="p-3">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {key === "ta" ? (taskNumber === "1" ? "TA" : "TR") : key.toUpperCase()}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className={`text-lg font-bold px-3 py-1 ${bandToColor(score)}`}>
                      {score}
                    </Badge>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <BandBar score={score} />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("results", "disclaimer", lang)}
      </p>
    </motion.div>
  );
}
