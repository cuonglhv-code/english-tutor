"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, ShieldCheck, Zap, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { useTranslation } from "@/lib/i18n/useTranslation";

export function LoginPageContent({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
    const { dict, lang } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Default landing after login should be Practice or Tutor.
    // If a protected page redirected here, it will pass `?next=...` and we honor it.
    const nextUrl = searchParams.get("next") || `/${lang}/practice`;

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
                    toast.error(error.message);
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
                    toast.error(error.message);
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
                    toast.success(lang === "vi" ? "Đăng ký thành công!" : "Registration successful!");
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
            toast.error(lang === "vi" ? "Đã có lỗi xảy ra." : "An error occurred.");
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
            <div className="hidden lg:flex flex-col justify-center p-12 xl:p-24 relative overflow-hidden bg-surface-container-low/50">
                <div className="max-w-xl space-y-12 relative z-10">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-stitched group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight text-on-surface font-display">
                                Scholar<span className="text-primary">AI</span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 -mt-1">Digital Mentor</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-6xl font-black leading-[0.9] tracking-tighter font-display text-on-surface">
                            {lang === "vi" ? "Nâng tầm" : "Elevate"}
                            <br />
                            <span className="text-primary italic">
                                {lang === "vi" ? "Học thuật." : "Academic Tone."}
                            </span>
                        </h2>
                        <p className="text-xl text-on-surface-variant font-medium leading-relaxed opacity-70">
                            {dict.login.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4 p-8 rounded-[32px] bg-white shadow-premium">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-secondary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest text-on-surface">
                                    {lang === "vi" ? "Chấm điểm tức thì" : "Instant Scoring"}
                                </p>
                                <p className="text-[11px] text-on-surface-variant opacity-60 font-medium">
                                    {lang === "vi" ? "Kết quả phản hồi trong 10 giây" : "Band score & feedback in 10s"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4 p-8 rounded-[32px] bg-white shadow-premium">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest text-on-surface">
                                    {lang === "vi" ? "An toàn" : "Secure Auth"}
                                </p>
                                <p className="text-[11px] text-on-surface-variant opacity-60 font-medium">
                                    {lang === "vi" ? "Tiêu chuẩn bảo mật tổ chức" : "Institutional security standards"}
                                </p>
                            </div>
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
                                <CardTitle className="text-4xl font-black font-display tracking-tight text-on-surface">
                                    {mode === "login" ? dict.login.title : (lang === 'vi' ? 'Tạo tài khoản' : 'Join Scholar')}
                                </CardTitle>
                            </div>
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                                    {mode === "login" ? dict.login.desc : (lang === 'vi' ? 'Tham gia hệ sinh thái học thuật của chúng tôi.' : 'Join our institutional ecosystem.')}
                                </CardDescription>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-primary font-black uppercase tracking-widest text-[10px] px-0 hover:bg-transparent hover:text-secondary transition-colors"
                                >
                                    {mode === "login" ? dict.login.registerLink : dict.login.loginBtn}
                                </Button>
                            </div>
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
                                            <Label className={`flex items-center gap-2 ml-6 text-[10px] font-black uppercase tracking-widest ${errors.displayName ? "text-secondary" : "text-on-surface-variant opacity-50"}`}>
                                                <User className="h-3.5 w-3.5" /> {lang === 'vi' ? 'Tên hiển thị' : 'Display Name'}
                                            </Label>
                                            <Input
                                                placeholder={lang === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. John Doe"}
                                                className={`rounded-2xl h-14 bg-surface-container-low border-none focus-visible:ring-4 focus-visible:ring-primary/10 text-base font-semibold ${errors.displayName ? "bg-secondary/5" : ""}`}
                                                value={displayName}
                                                onChange={(e) => {
                                                    setDisplayName(e.target.value);
                                                    if (errors.displayName) setErrors(prev => ({ ...prev, displayName: "" }));
                                                }}
                                                disabled={loading}
                                            />
                                            {errors.displayName && <p className="text-[10px] font-black text-secondary ml-6 uppercase tracking-widest">{errors.displayName}</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1.5">
                                    <Label className={`flex items-center gap-2 ml-6 text-[10px] font-black uppercase tracking-widest ${errors.email ? "text-secondary" : "text-on-surface-variant opacity-50"}`}>
                                        <Mail className="h-3.5 w-3.5" /> {dict.login.emailLabel}
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        className={`rounded-2xl h-14 bg-surface-container-low border-none focus-visible:ring-4 focus-visible:ring-primary/10 text-base font-semibold ${errors.email ? "bg-secondary/5" : ""}`}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                        }}
                                        required
                                        disabled={loading}
                                    />
                                    {errors.email && <p className="text-[10px] font-black text-secondary ml-6 uppercase tracking-widest">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className={`flex items-center gap-2 ml-6 text-[10px] font-black uppercase tracking-widest ${errors.password ? "text-secondary" : "text-on-surface-variant opacity-50"}`}>
                                        <Lock className="h-3.5 w-3.5" /> {dict.login.passwordLabel}
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className={`rounded-2xl h-14 bg-surface-container-low border-none focus-visible:ring-4 focus-visible:ring-primary/10 text-base font-semibold ${errors.password ? "bg-secondary/5" : ""}`}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                        }}
                                        required
                                        disabled={loading}
                                    />
                                    {errors.password ? (
                                        <p className="text-[10px] font-black text-secondary ml-6 uppercase tracking-widest">{errors.password}</p>
                                    ) : mode === "register" && (
                                        <p className="text-[10px] text-muted-foreground ml-1">
                                            {lang === "vi" ? "* Ít nhất 8 ký tự" : "* Minimum 8 characters"}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${mode === "login"
                                        ? "gradient-primary"
                                        : "gradient-secondary"
                                        }`}
                                    disabled={loading}
                                >
                                    {loading
                                        ? (mode === "login" ? 'Authorizing...' : 'Registering...')
                                        : (mode === "login" ? dict.login.loginBtn : (lang === 'vi' ? 'Tạo tài khoản' : 'Join Now'))
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
