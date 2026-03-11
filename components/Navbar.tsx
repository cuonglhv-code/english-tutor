"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, BookOpen, LayoutDashboard, LogIn, LogOut, Library, Mail, ShieldCheck, ClipboardList } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t, type Lang } from "@/lib/i18n";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

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
  const { user, role } = useUser();
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const channelRef = useRef<any>(null);

  // Fetch unread count and subscribe to new messages
  useEffect(() => {
    if (!user) { setUnread(0); return; }

    // Initial fetch
    fetch("/api/messages")
      .then(r => r.json())
      .then(json => setUnread(json.unread ?? 0))
      .catch(() => { });

    // Realtime subscription for new incoming messages
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("navbar-inbox")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `recipient_id=eq.${user.id}`,
      }, () => setUnread(n => n + 1))
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `recipient_id=is.null`,
      }, () => setUnread(n => n + 1))
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user]);

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
          {role !== "admin" && (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <PenLine className="h-4 w-4" /> {t("nav", "practice", lang)}
              </Link>
              <Link
                href="/practice"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === "vi" ? "Thư viện" : "Library"}</span>
              </Link>
              <Link
                href="/writing-101"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "writing101", lang)}</span>
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "courses", lang)}</span>
              </Link>
              <Link
                href="/placement"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-jaxtina-blue hover:bg-jaxtina-blue/10 transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "placement", lang)}</span>
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav", "dashboard", lang)}</span>
              </Link>
              {role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-jaxtina-blue hover:bg-jaxtina-blue/10 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                href="/inbox"
                onClick={() => setUnread(0)}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                aria-label="Inbox"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === "vi" ? "Hộp thư" : "Inbox"}</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-jaxtina-red text-white text-[9px] font-black flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
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
