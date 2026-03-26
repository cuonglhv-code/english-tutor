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
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Default landing after login should be Tutor.
    // If a protected page redirected here, it will pass `?next=...` and we honor it.
    const nextUrl = searchParams.get("next") || "/tutor";

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!email.includes("@")) {
            newErrors.email = lang === "vi" ? "Email không hợp lệ." : "Invalid email address.";
        }
        if (mode === "register") {
            if (!displayName.trim()) {
                newErrors.displayName = lang === "vi" ? "Vui lòng nhập họ tên." : "Please enter your name.";
            }
            if (password.length < 8) {
                newErrors.password = lang === "vi" ? "Mật khẩu ít nhất 8 ký tự." : "Password must be at least 8 chars.";
            }
        } else {
            if (!password) {
                newErrors.password = lang === "vi" ? "Vui lòng nhập mật khẩu." : "Please enter your password.";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        const supabase = createBrowserClient();

        try {
            if (mode === "login") {
                const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    toast.error(t("auth", "errorInvalid", lang) || error.message);
                    setLoading(false);
                    return;
                }

                let targetUrl = nextUrl;
                if (authData?.user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role, profile_completed")
                        .eq("id", authData.user.id)
                        .single();

                    if (profile?.role === "admin" && (targetUrl === "/" || targetUrl === "/tutor")) {
                        targetUrl = "/admin/dashboard";
                    }
                }

                toast.success(lang === "vi" ? "Đăng nhập thành công!" : "Logged in successfully!");
                // Hard-navigate to avoid App Router transition/session timing issues.
                window.location.href = targetUrl;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: displayName || email.split("@")[0] } },
                });
                if (error) {
                    toast.error(error.message || t("auth", "errorGeneric", lang));
                    setLoading(false);
                    return;
                }
                // If email confirmation is enabled, there may be no session yet.
                const needsConfirmation = data?.user && !(data as any)?.session;
                
                if (needsConfirmation) {
                    toast.success(
                        lang === "vi" 
                            ? "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản." 
                            : "Registration successful! Please check your email to confirm your account.",
                        { duration: 6000 }
                    );
                } else {
                    toast.success(t("auth", "successRegister", lang));
                }

                // Still direct users toward Tutor; if not authenticated they will be prompted accordingly.
                const targetUrl = "/tutor";
                
                // If it needs confirmation, give the user a second to see the toast before redirect
                if (needsConfirmation) {
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 2000);
                } else {
                    window.location.href = targetUrl;
                }
            }
        } catch {
            toast.error(t("auth", "errorGeneric", lang));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] max-w-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] max-w-full" />
            </div>

            {/* Left Column: Branding & Marketing (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center p-12 xl:p-24 relative overflow-hidden bg-muted/30">
                <div className="max-w-xl space-y-12">
                    <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer group">
                        <div className="h-12 w-12 rounded-2xl gradient-secondary flex items-center justify-center shadow-stitched group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 font-display">
                            Jaxtina IELTS Examiner
                        </span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-5xl font-black leading-tight tracking-tight font-display">
                            {lang === "vi" ? "Nâng tầm kỹ năng" : "Elevate Your"}
                            <br />
                            <span className="text-secondary">
                                {lang === "vi" ? "Viết IELTS" : "IELTS Writing"}
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {lang === "vi"
                                ? "Cánh cửa dẫn đến điểm band mục tiêu. Được chấm điểm tức thì bởi AI Examiner chuyên sâu của chúng tôi."
                                : "The highway to your target band score. Get instant feedback from our specialized AI Examiner."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 p-4 rounded-2xl bg-surface/50 border border-border shadow-stitched">
                            <Zap className="h-6 w-6 text-secondary" />
                            <p className="font-bold text-sm">
                                {lang === "vi" ? "Chấm điểm tức thì" : "Instant Scoring"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {lang === "vi" ? "Kết quả phản hồi trong 10 giây" : "Band score & feedback in 10s"}
                            </p>
                        </div>
                        <div className="space-y-2 p-4 rounded-2xl bg-surface/50 border border-border shadow-stitched">
                            <Globe2 className="h-6 w-6 text-primary" />
                            <p className="font-bold text-sm">
                                {lang === "vi" ? "Đa ngôn ngữ" : "Multilingual"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {lang === "vi" ? "Giải thích chi tiết Tiếng Anh & Việt" : "Detailed EN & VI explanations"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="relative flex flex-col justify-center lg:items-center overflow-y-auto px-4 sm:px-8 py-12 lg:py-0 w-full max-w-md mx-auto">
                <div className="w-full space-y-8">
                    {/* Compact Hero (Mobile Only) */}
                    <div className="flex lg:hidden flex-col items-center text-center space-y-4 mb-8">
                        <div className="h-16 w-16 rounded-3xl gradient-secondary flex items-center justify-center shadow-stitched mb-2">
                            <GraduationCap className="h-9 w-9 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight font-display">
                            {lang === "vi" ? "Chấm thi IELTS AI" : "IELTS AI Examiner"}
                        </h1>
                        <p className="text-sm text-muted-foreground px-6 leading-relaxed">
                            {lang === "vi"
                                ? "Nhận kết quả Band Score và nhận xét chi tiết ngay lập tức cho bài viết của bạn."
                                : "Get your IELTS Writing band score and detailed feedback instantly."}
                        </p>
                    </div>

                    <Card className="border-none shadow-none lg:shadow-stitched lg:border lg:bg-card/50 lg:backdrop-blur-xl rounded-[2.5rem]">
                        <CardHeader className="space-y-1 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-2xl font-black">
                                    {mode === "login" ? t("auth", "loginTitle", lang) : t("auth", "registerTitle", lang)}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-primary font-bold px-0 hover:bg-transparent hover:text-primary/80"
                                >
                                    {mode === "login" ? t("auth", "signupLink", lang) : t("auth", "loginLink", lang)}
                                </Button>
                            </div>
                            <CardDescription className="text-xs sm:text-sm font-medium">
                                {mode === "login" ? t("auth", "loginDesc", lang) : t("auth", "registerDesc", lang)}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <form onSubmit={handleAuth} className="space-y-5">
                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1.5"
                                        >
                                            <Label className={`flex items-center gap-1.5 ml-1 text-sm font-bold ${errors.displayName ? "text-red-500" : ""}`}>
                                                <User className="h-3.5 w-3.5" /> {t("auth", "displayNameLabel", lang)}
                                            </Label>
                                            <Input
                                                placeholder={lang === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. John Doe"}
                                                className={`rounded-xl h-12 bg-background/50 text-base ${errors.displayName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                value={displayName}
                                                onChange={(e) => {
                                                    setDisplayName(e.target.value);
                                                    if (errors.displayName) setErrors(prev => ({ ...prev, displayName: "" }));
                                                }}
                                                disabled={loading}
                                            />
                                            {errors.displayName && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.displayName}</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1.5">
                                    <Label className={`flex items-center gap-1.5 ml-1 text-sm font-bold ${errors.email ? "text-red-500" : ""}`}>
                                        <Mail className="h-3.5 w-3.5" /> {t("auth", "emailLabel", lang)}
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        className={`rounded-xl h-12 bg-background/50 text-base ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                        }}
                                        required
                                        disabled={loading}
                                    />
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className={`flex items-center gap-1.5 ml-1 text-sm font-bold ${errors.password ? "text-red-500" : ""}`}>
                                        <Lock className="h-3.5 w-3.5" /> {t("auth", "passwordLabel", lang)}
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className={`rounded-xl h-12 bg-background/50 text-base ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                        }}
                                        required
                                        disabled={loading}
                                    />
                                    {errors.password ? (
                                        <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.password}</p>
                                    ) : mode === "register" && (
                                        <p className="text-[10px] text-muted-foreground ml-1">
                                            {lang === "vi" ? "* Ít nhất 8 ký tự" : "* Minimum 8 characters"}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 ${mode === "login"
                                        ? "gradient-secondary"
                                        : "gradient-primary"
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

                    <p className="text-center px-4 mt-6 text-xs text-muted-foreground tracking-wider font-bold opacity-50">
                        Official IELTS Product of Jaxtina English Group
                    </p>
                </div>
            </div>
        </div>
    );
}
