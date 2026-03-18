"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, BookOpen, LayoutDashboard, LogIn, LogOut, Library, Mail, ShieldCheck, ClipboardList, MessageSquare, User as UserIcon, Gamepad2, FileText } from "lucide-react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const tutorRef = useRef<HTMLDivElement | null>(null);

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

  // Fetch basic student details for profile panel
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setDisplayName(null);
      return;
    }
    const supabase = createBrowserClient();
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (cancelled) return;
        setDisplayName((data as any)?.display_name ?? null);
      } catch {
        if (cancelled) return;
        setDisplayName(null);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Close profile panel on outside click / Escape
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = profileRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  // Close practice panel on outside click / Escape
  useEffect(() => {
    if (!practiceOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = practiceRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setPracticeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPracticeOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [practiceOpen]);

  // Close tutor panel on outside click / Escape
  useEffect(() => {
    if (!tutorOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = tutorRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setTutorOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTutorOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [tutorOpen]);

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
              <div className="relative" ref={practiceRef}>
                <button
                  onClick={() => setPracticeOpen(o => !o)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={practiceOpen}
                >
                  <PenLine className="h-4 w-4" /> {t("nav", "practice", lang)}
                </button>

                {practiceOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-2 w-56 rounded-xl border bg-card shadow-lg p-2"
                  >
                    <Link
                      href="/"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <PenLine className="h-4 w-4" />
                      {t("nav", "practice", lang)}
                    </Link>
                    <Link
                      href="/practice"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <Library className="h-4 w-4" />
                      <span>{lang === "vi" ? "Thư viện" : "Library"}</span>
                    </Link>
                    <Link
                      href="/full-test"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{lang === "vi" ? "Thi thử" : "Full test"}</span>
                    </Link>
                  </div>
                )}
              </div>
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

          <div className="relative" ref={tutorRef}>
            <button
              onClick={() => setTutorOpen(o => !o)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              aria-haspopup="menu"
              aria-expanded={tutorOpen}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === "vi" ? "Gia sư" : "Tutor"}</span>
            </button>

            {tutorOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-56 rounded-xl border bg-card shadow-lg p-2"
              >
                <Link
                  href="/tutor"
                  onClick={() => setTutorOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  role="menuitem"
                >
                  <MessageSquare className="h-4 w-4" />
                  {lang === "vi" ? "Gia sư" : "Tutor"}
                </Link>
                <Link
                  href="/quiz"
                  onClick={() => setTutorOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  role="menuitem"
                >
                  <Gamepad2 className="h-4 w-4" />
                  {lang === "vi" ? "Trắc nghiệm" : "Quiz"}
                </Link>
              </div>
            )}
          </div>
          {user ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-jaxtina-blue hover:bg-jaxtina-blue/10 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Student Profile sub-panel */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {displayName || user.email?.split("@")[0] || (lang === "vi" ? "Hồ sơ" : "Profile")}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-xl border bg-card shadow-lg p-2"
                  >
                    <div className="px-3 py-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        {lang === "vi" ? "HỒ SƠ HỌC VIÊN" : "STUDENT PROFILE"}
                      </div>
                      <div className="mt-1 text-sm font-bold text-foreground truncate">
                        {displayName || user.email || user.id}
                      </div>
                      {user.email && (
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      )}
                    </div>

                    <div className="my-2 h-px bg-border" />

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("nav", "dashboard", lang)}
                    </Link>

                    <Link
                      href="/inbox"
                      onClick={() => { setUnread(0); setProfileOpen(false); }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {lang === "vi" ? "Hộp thư" : "Inbox"}
                      </span>
                      {unread > 0 && (
                        <span className="min-w-[18px] h-5 px-1.5 rounded-full bg-jaxtina-red text-white text-[10px] font-black flex items-center justify-center">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/student"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <BookOpen className="h-4 w-4" />
                      {lang === "vi" ? "Thông tin học viên" : "Student details"}
                    </Link>

                    <div className="my-2 h-px bg-border" />

                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav", "logout", lang)}
                    </button>
                  </div>
                )}
              </div>
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
