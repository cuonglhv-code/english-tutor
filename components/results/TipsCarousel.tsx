"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  tips: string[];
  lang: Lang;
}

export function TipsCarousel({ tips, lang }: Props) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + tips.length) % tips.length);
  const next = () => setIdx((i) => (i + 1) % tips.length);

  if (!tips || tips.length === 0) return null;

  return (
    <div className="rounded-xl border bg-gradient-to-br from-jaxtina-blue/5 to-jaxtina-red/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h2 className="font-bold text-lg">{lang === "vi" ? "Mẹo cá nhân hóa" : "Personalised Tips"}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{idx + 1} / {tips.length}</span>
      </div>

      <div className="relative min-h-[80px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="text-sm leading-relaxed"
          >
            {tips[idx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="sm" onClick={prev}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {t("results", "prev", lang)}
        </Button>
        <div className="flex gap-1">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-4 bg-jaxtina-red" : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={next}>
          {t("results", "next", lang)} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
