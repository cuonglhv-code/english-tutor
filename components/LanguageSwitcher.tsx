"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "vi" : "en";
    setLang(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-6 py-2 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container-high active:scale-95 group",
        "border-none shadow-sm h-10"
      )}
    >
      <Globe className="h-4 w-4 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {lang === "en" ? "EN" : "VI"}
      </span>
    </button>
  );
}
