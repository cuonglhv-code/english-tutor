"use client";

import { usePathname, useRouter } from "next/navigation";
import { en } from "./en";
import { vi } from "./vi";
import type { Dictionary } from "./en";

export function useTranslation() {
  const pathname = usePathname();
  const router = useRouter();
  
  const lang = pathname.startsWith("/vi") ? "vi" : "en";
  const dict: Dictionary = lang === "vi" ? vi : en;

  const setLang = (newLang: "en" | "vi") => {
    if (newLang === lang) return;
    
    const segments = pathname.split("/");
    // pathname format: /en/path or /vi/path
    segments[1] = newLang;
    const newPath = segments.join("/");
    
    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLang};path=/;max-age=31536000`;
    
    router.push(newPath);
  };

  return { dict, lang, setLang };
}
