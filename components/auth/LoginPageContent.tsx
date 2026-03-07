"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, ShieldCheck, Zap, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export function LoginPageContent() {
    const { lang } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

    const nextUrl = searchParams.get("next") || "/";

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createBrowserClient();

        try {
            if (mode === "login") {
                const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    toast.error(t("auth", "errorInvalid", lang) || error.message);
                    return;
                }

                let targetUrl = nextUrl;
                if (authData?.user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role, profile_completed")
                        .eq("id", authData.user.id)
                        .single();

                    if (profile?.role === "admin" && targetUrl === "/") {
                        targetUrl = "/admin/dashboard";
                    } else if (profile?.profile_completed !== true) {
                        targetUrl = "/personal-details";
                    }
                }

                toast.success(lang === "vi" ? "Đăng nhập thành công!" : "Logged in successfully!");
                router.refresh();
                router.push(targetUrl);
            } else {
                if (password.length < 8) {
                    toast.error(lang === "vi" ? "Mật khẩu phải từ 8 ký tự." : "Password must be at least 8 chars.");
                    setLoading(false);
                    return;
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: displayName || email.split("@")[0] } },
                });
                if (error) {
                    toast.error(error.message || t("auth", "errorGeneric", lang));
                    return;
                }
                toast.success(t("auth", "successRegister", lang));
                router.refresh();
                // Send new users directly to the profile completion screen
                router.push("/personal-details");
            }
        } catch {
            toast.error(t("auth", "errorGeneric", lang));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 lg:py-16 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-jaxtina-red/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-jaxtina-blue/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Marketing/Value Prop */}
                <div className="hidden lg:flex flex-col space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-jaxtina-red/10 px-4 py-1.5 text-jaxtina-red text-sm font-bold w-fit">
                        <GraduationCap className="h-4 w-4" />
                        Jaxtina IELTS Examiner
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                            {lang === "vi" ? (
                                <>
                                    Chấm bài <span className="text-jaxtina-red">IELTS Writing</span> ngay lập tức với AI.
                                </>
                            ) : (
                                <>
                                    Get your <span className="text-jaxtina-red">IELTS Writing</span> band score instantly.
                                </>
                            )}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {lang === "vi"
                                ? "Simulate buổi thi thật với AI Examiner thế hệ mới. Phản hồi chi tiết theo 4 tiêu chí chấm thi IELTS."
                                : "Experience the most advanced AI Examiner. Get detailed feedback mapped to IELTS criteria and track your progression."}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm border flex items-center justify-center text-jaxtina-blue">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{lang === "vi" ? "Chính xác cao" : "High Accuracy"}</p>
                                <p className="text-xs text-muted-foreground">{lang === "vi" ? "Dựa trên tiêu chí IDP/BC" : "Based on IELTS descriptors"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm border flex items-center justify-center text-jaxtina-red">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{lang === "vi" ? "Tức thì" : "Instant Feeedback"}</p>
                                <p className="text-xs text-muted-foreground">{lang === "vi" ? "Kết quả trong 30 giây" : "Get scores in seconds"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm border flex items-center justify-center text-green-600">
                                <Globe2 className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{lang === "vi" ? "Song ngữ" : "Bilingual"}</p>
                                <p className="text-xs text-muted-foreground">{lang === "vi" ? "Phản hồi Anh - Việt" : "Feedback in EN & VI"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm border flex items-center justify-center text-orange-500">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{lang === "vi" ? "Bản quyền" : "Official"}</p>
                                <p className="text-xs text-muted-foreground">{lang === "vi" ? "Từ Jaxtina English" : "By Jaxtina English Group"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="w-full">
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card/50 backdrop-blur-xl">
                        <div className="p-1 bg-muted flex border-b">
                            <button
                                onClick={() => setMode("login")}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === "login" ? "bg-background text-jaxtina-red rounded-t-2xl shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t("auth", "loginBtn", lang)}
                            </button>
                            <button
                                onClick={() => setMode("register")}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === "register" ? "bg-background text-jaxtina-blue rounded-t-2xl shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t("auth", "registerBtn", lang)}
                            </button>
                        </div>

                        <CardContent className="p-8 pt-10">
                            <form onSubmit={handleAuth} className="space-y-5">
                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-1.5"
                                        >
                                            <Label className="flex items-center gap-1.5 ml-1 text-sm font-bold">
                                                <User className="h-3.5 w-3.5" /> {t("auth", "displayNameLabel", lang)}
                                            </Label>
                                            <Input
                                                type="text"
                                                placeholder={lang === "vi" ? "Nguyen Van A" : "Your full name"}
                                                className="rounded-xl h-12 bg-background/50"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                disabled={loading}
                                                required={mode === "register"}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 ml-1 text-sm font-bold">
                                        <Mail className="h-3.5 w-3.5" /> {t("auth", "emailLabel", lang)}
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="you@email.com"
                                        className="rounded-xl h-12 bg-background/50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 ml-1 text-sm font-bold">
                                        <Lock className="h-3.5 w-3.5" /> {t("auth", "passwordLabel", lang)}
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl h-12 bg-background/50"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        minLength={mode === "register" ? 8 : undefined}
                                    />
                                    {mode === "register" && (
                                        <p className="text-[10px] text-muted-foreground ml-1">
                                            {lang === "vi" ? "* Ít nhất 8 ký tự" : "* Minimum 8 characters"}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-14 rounded-xl font-black text-lg shadow-lg transition-all active:scale-95 ${mode === "login"
                                        ? "bg-jaxtina-red hover:bg-jaxtina-red/90 shadow-jaxtina-red/20"
                                        : "bg-jaxtina-blue hover:bg-jaxtina-blue/90 shadow-jaxtina-blue/20"
                                        }`}
                                    disabled={loading}
                                >
                                    {loading
                                        ? (mode === "login" ? t("auth", "loggingIn", lang) : t("auth", "registering", lang))
                                        : (mode === "login" ? t("auth", "loginBtn", lang) : t("auth", "registerBtn", lang))
                                    }
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-dashed">
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4 gap-3 items-center">
                                    <div className="h-8 w-8 rounded-full bg-jaxtina-red/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-4 w-4 text-jaxtina-red" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold leading-tight">
                                            {lang === "vi" ? "Gặp khó khăn khi đăng nhập?" : "Trouble logging in?"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                            {lang === "vi"
                                                ? "Kiểm tra kỹ email để nhận link xác nhận. Liên hệ hỗ trợ nếu cần."
                                                : "Please confirm your email link if registering. Contact support if needed."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center mt-6 text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                        Official IELTS Product of Jaxtina English Group
                    </p>
                </div>
            </div>
        </div>
    );
}
