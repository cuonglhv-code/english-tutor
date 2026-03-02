"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, BookOpen, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t, type Lang } from "@/lib/i18n";
import { toast } from "sonner";

function JaxtinaMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#D32F2F" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        J
      </text>
    </svg>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "vi" : "en")}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-border hover:bg-muted transition-colors select-none"
      title={lang === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "text-foreground" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={lang === "vi" ? "text-foreground" : "text-muted-foreground"}>VI</span>
    </button>
  );
}

export function Navbar() {
  const { user } = useUser();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    toast.success(lang === "vi" ? "Đã đăng xuất." : "Logged out.");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <JaxtinaMark />
          <div className="flex flex-col leading-none">
            <span className="font-black text-base tracking-tight text-foreground">
              Jaxtina
              <span className="ml-1.5 rounded bg-jaxtina-blue px-1 py-px text-[9px] font-bold text-white align-middle">
                ENGLISH
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium -mt-0.5">
              IELTS Examiner
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <PenLine className="h-4 w-4" /> {t("nav", "practice", lang)}
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <BookOpen className="h-4 w-4" /> {t("nav", "courses", lang)}
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "dashboard", lang)}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "logout", lang)}</span>
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav", "login", lang)}</span>
            </Link>
          )}

          <LangToggle lang={lang} setLang={setLang} />
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
