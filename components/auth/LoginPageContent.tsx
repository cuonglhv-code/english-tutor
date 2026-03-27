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
        <div className="relative min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 overflow-hidden bg-surface">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px]" />
            </div>

            {/* Left Column: Branding & Marketing (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center p-12 xl:p-32 relative overflow-hidden bg-gradient-to-b from-white to-surface-container-low/30">
                {/* Academic Context Motif - Faint Notation Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                
                {/* Soft Vertical Depth */}
                <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
                
                <div className="max-w-xl space-y-20 relative z-10">
                    {/* Logo Section */}
                    <div className="flex items-center gap-5 group cursor-pointer w-fit">
                        <div className="h-16 w-16 rounded-[22px] bg-primary flex items-center justify-center shadow-[0_12px_40px_rgba(var(--primary-rgb),0.15)] group-hover:scale-105 transition-all duration-700">
                            <GraduationCap className="h-9 w-9 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-on-surface font-display">
                                Jaxtina<span className="text-primary italic">Tutor</span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-30 -mt-1">Powered by Claude AI</span>
                        </div>
                    </div>

                    {/* Headline & Subtext */}
                    <div className="space-y-10">
                        <h2 className="text-7xl font-black leading-[0.85] tracking-tighter font-display text-on-surface">
                            <span className="opacity-90">{lang === "vi" ? "Nâng tầm" : "Elevate"}</span>
                            <br />
                            <span className="text-primary font-bold tracking-tight inline-block mt-2" style={{ letterSpacing: '-0.02em' }}>
                                {lang === "vi" ? "Học thuật." : "Academic Tone."}
                            </span>
                        </h2>
                        <p className="text-[22px] text-on-surface-variant font-medium leading-[1.6] opacity-60 max-w-[85%] border-l-4 border-primary/10 pl-8 py-2">
                            {dict.login.desc}
                        </p>
                    </div>

                    {/* Benefit Cards Container */}
                    <div className="grid grid-cols-2 gap-8 pt-4">
                        {/* Benefit Card 1 */}
                        <div className="group space-y-5 p-8 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-700">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center relative overflow-hidden group-hover:bg-secondary/20 transition-colors">
                                <Zap className="h-6 w-6 text-secondary relative z-10" />
                                <div className="absolute inset-0 bg-secondary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-[14px] uppercase tracking-[0.2em] text-on-surface">
                                    {lang === "vi" ? "Chấm điểm tức thì" : "Instant Scoring"}
                                </p>
                                <p className="text-[12px] text-on-surface-variant opacity-50 font-semibold leading-relaxed">
                                    {lang === "vi" ? "Kết quả phản hồi trong 10 giây" : "Band score & feedback in 10s"}
                                </p>
                            </div>
                        </div>

                        {/* Benefit Card 2 */}
                        <div className="group space-y-5 p-8 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-700">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/20 transition-colors">
                                <ShieldCheck className="h-6 w-6 text-primary relative z-10" />
                                <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-[14px] uppercase tracking-[0.2em] text-on-surface">
                                    {lang === "vi" ? "An toàn" : "Secure Auth"}
                                </p>
                                <p className="text-[12px] text-on-surface-variant opacity-50 font-semibold leading-relaxed">
                                    {lang === "vi" ? "Tiêu chuẩn bảo mật tổ chức" : "Institutional security standards"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="relative flex flex-col justify-center lg:items-center overflow-y-auto px-4 sm:px-8 py-12 lg:py-0 w-full">
                <div className="w-full max-w-[440px] space-y-10 relative">
                    {/* Visual background for the card section */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.02)_0%,transparent_70%)] pointer-events-none" />

                    {/* Compact Hero (Mobile Only) */}
                    <div className="flex lg:hidden flex-col items-center text-center space-y-6 mb-12">
                        <div className="h-20 w-20 rounded-[28px] bg-primary flex items-center justify-center shadow-stitched mb-2">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight font-display">
                            {lang === "vi" ? "Chấm thi IELTS AI" : "IELTS AI Examiner"}
                        </h1>
                        <p className="text-base text-muted-foreground px-6 leading-relaxed opacity-60">
                            {lang === "vi"
                                ? "Nhận kết quả Band Score và nhận xét chi tiết ngay lập tức cho bài viết của bạn."
                                : "Get your IELTS Writing band score and detailed feedback instantly."}
                        </p>
                    </div>

                    <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.06)] lg:bg-white lg:backdrop-blur-2xl rounded-[3rem] relative overflow-hidden border border-white/40">
                        {/* Inner Top Glow */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                        
                        <CardHeader className="space-y-4 pt-12 pb-8 px-10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-4xl font-black font-display tracking-tight text-on-surface leading-tight">
                                    {mode === "login" ? dict.login.title : (lang === 'vi' ? 'Tạo tài khoản' : 'Join Jaxtina')}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-primary font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 h-auto rounded-full bg-primary/5 hover:bg-primary/10 transition-all"
                                >
                                    {mode === "login" ? dict.login.registerLink : dict.login.loginBtn}
                                </Button>
                            </div>
                            <CardDescription className="text-[11px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-30 leading-none">
                                {mode === "login" ? dict.login.desc : (lang === 'vi' ? 'Tham gia hệ sinh thái học thuật của chúng tôi.' : 'Join our institutional ecosystem.')}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-10 pb-12 space-y-10">
                            <form onSubmit={handleAuth} className="space-y-6">
                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-2.5"
                                        >
                                            <Label className={`flex items-center gap-2 ml-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${errors.displayName ? "text-secondary" : "text-on-surface-variant/40"}`}>
                                                {lang === 'vi' ? 'Tên hiển thị' : 'Display Name'}
                                            </Label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder={lang === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. John Doe"}
                                                    className={`rounded-[24px] h-14 pl-14 bg-surface-container-low border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 focus-visible:bg-white text-base font-semibold shadow-sm transition-all ${errors.displayName ? "border-secondary/30 bg-secondary/5" : ""}`}
                                                    value={displayName}
                                                    onChange={(e) => {
                                                        setDisplayName(e.target.value);
                                                        if (errors.displayName) setErrors(prev => ({ ...prev, displayName: "" }));
                                                    }}
                                                    disabled={loading}
                                                />
                                            </div>
                                            {errors.displayName && <p className="text-[10px] font-black text-secondary ml-4 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{errors.displayName}</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2.5">
                                    <Label className={`flex items-center gap-2 ml-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${errors.email ? "text-secondary" : "text-on-surface-variant/40"}`}>
                                        {dict.login.emailLabel}
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            className={`rounded-[24px] h-14 pl-14 bg-surface-container-low border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 focus-visible:bg-white text-base font-semibold shadow-sm transition-all ${errors.email ? "border-secondary/30 bg-secondary/5" : ""}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-black text-secondary ml-4 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-2.5">
                                    <Label className={`flex items-center gap-2 ml-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${errors.password ? "text-secondary" : "text-on-surface-variant/40"}`}>
                                        {dict.login.passwordLabel}
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className={`rounded-[24px] h-14 pl-14 bg-surface-container-low border-2 border-transparent focus-visible:ring-0 focus-visible:border-primary/20 focus-visible:bg-white text-base font-semibold shadow-sm transition-all ${errors.password ? "border-secondary/30 bg-secondary/5" : ""}`}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.password ? (
                                        <p className="text-[10px] font-black text-secondary ml-4 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{errors.password}</p>
                                    ) : mode === "register" && (
                                        <p className="text-[10px] text-muted-foreground ml-4 opacity-40 font-bold tracking-wide">
                                            {lang === "vi" ? "* Ít nhất 8 ký tự" : "* Minimum 8 characters"}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-16 rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-[0_15px_40px_-10px_rgb(var(--primary-rgb),0.3)] hover:shadow-[0_20px_50px_-10px_rgb(var(--primary-rgb),0.4)] transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 overflow-hidden group
                                        ${mode === "login" ? "bg-gradient-to-r from-primary to-[#ff4d4d]" : "bg-gradient-to-r from-secondary to-[#fb923c]"}
                                    `}
                                    disabled={loading}
                                >
                                    <span className="relative z-10">
                                        {loading
                                            ? (mode === "login" ? (lang === 'vi' ? 'Đang đăng nhập...' : 'Signing in...') : (lang === 'vi' ? 'Đang đăng ký...' : 'Registering...'))
                                            : (mode === "login" ? dict.login.loginBtn : (lang === 'vi' ? 'Đăng ký' : 'Join Now'))
                                        }
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </form>

                            <div className="pt-8 border-t border-dashed border-on-surface-variant/10">
                                <div className="flex bg-surface-container-low border border-on-surface-variant/5 rounded-3xl p-5 gap-4 items-center group/help">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover/help:scale-110 transition-transform duration-500">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-black text-on-surface uppercase tracking-wide">
                                            {lang === "vi" ? "Gặp khó khăn?" : "Trouble logging in?"}
                                        </p>
                                        <p className="text-[10.5px] text-on-surface-variant leading-snug opacity-40 font-medium">
                                            {lang === "vi"
                                                ? "Kiểm tra kỹ email của bạn. Liên hệ đội ngũ hỗ trợ nếu cần thêm trợ giúp."
                                                : "Please confirm your email link if registering. Contact support if needed."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center px-4 text-[10px] text-on-surface-variant tracking-[0.2em] font-black uppercase opacity-20">
                        Official IELTS Product of Jaxtina English Group
                    </p>
                </div>
            </div>
        </div>
    );
}
