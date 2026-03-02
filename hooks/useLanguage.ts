"use client";
import { useState, useEffect, useCallback } from "react";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "ielts_language";
const DEFAULT: Lang = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as Lang) || "en";

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "en" || stored === "vi") setLangState(stored);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  return { lang, setLang };
}
