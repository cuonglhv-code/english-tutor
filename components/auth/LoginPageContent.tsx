"use client";
import { useState, useEffect } from "react";
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
import { useUser } from "@/hooks/useUser";

export function LoginPageContent({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
    const { dict, lang } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    const [mode, setMode] = useState<"login" | "register">(initialMode);

    // Redirect to dashboard if already logged in - no flash
    useEffect(() => {
        if (!userLoading && user) {
            const target = searchParams.get("next");
            if (target?.startsWith("/") && !target.startsWith("//")) {
                router.replace(`/${lang}${target}`);
            } else {
                router.replace(`/${lang}/practice`);
            }
        }
    }, [userLoading, user, lang, router, searchParams]);
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

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const supabase = createBrowserClient();
        const callbackUrl = new URL(`/auth/callback`, window.location.origin);
        callbackUrl.searchParams.set('next', nextUrl);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: callbackUrl.toString(),
            },
        });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        }
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
        <div className="relative min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 overflow-hidden bg-[#FAFAF8] font-sans">
            {/* Background Playful Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        x: [0, 20, 0] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#26A69A]/5 blur-[100px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0],
                        x: [0, -30, 0] 
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[15%] w-[70%] h-[70%] rounded-full bg-[#FF7043]/5 blur-[120px]" 
                />
                {/* Wavy Dots Pattern */}
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#26A69A 0.8px, transparent 0.8px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Left Column: Branding & Marketing (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center p-12 xl:p-32 relative overflow-hidden">
                <div className="max-w-xl space-y-16 relative z-10">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 group cursor-pointer w-fit">
                        <div className="h-14 w-14 rounded-2xl bg-[#FF7043] flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-105 transition-all duration-500">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-slate-800">
                                Jaxtina<span className="text-[#FF7043]">Tutor</span>
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#26A69A] -mt-1">Powered by Claude AI</span>
                        </div>
                    </div>

                    {/* Headline & Subtext */}
                    <div className="space-y-8">
                        {/* Gamified Pill */}
                        <div className="inline-flex items-center gap-2 bg-[#26A69A]/10 px-4 py-1.5 rounded-full border border-[#26A69A]/20">
                            <span className="w-2 h-2 rounded-full bg-[#26A69A] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#26A69A]">
                                {dict.login.heroPill}
                            </span>
                        </div>
                        
                        <h2 className="text-6xl font-black leading-[1.05] tracking-tight text-slate-900 font-display">
                            <span className="text-slate-500">{dict.login.heroTitleLine1}</span>
                            <br />
                            <span className="text-slate-800">{dict.login.heroTitleLine2}</span>
                            <br />
                            <span className="text-[#FF7043] drop-shadow-sm">{dict.login.heroTitleLine3}</span>
                        </h2>
                        
                        <p className="text-xl text-slate-600/80 font-medium leading-relaxed max-w-[90%] border-l-4 border-slate-200 pl-6">
                            {dict.login.desc}
                        </p>
                    </div>

                    {/* Mission Cards ("Feature Cards") Container */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        {/* Mission Tile 1 */}
                        <div className="group space-y-4 p-7 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500">
                            <div className="w-10 h-10 rounded-full bg-[#26A69A]/10 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-[#26A69A]" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="font-black text-[12px] uppercase tracking-wider text-slate-800">
                                    {dict.login.feature1Title}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    {dict.login.feature1Body}
                                </p>
                            </div>
                        </div>

                        {/* Mission Tile 2 */}
                        <div className="group space-y-4 p-7 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500">
                            <div className="w-10 h-10 rounded-full bg-[#FF7043]/10 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-[#FF7043]" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="font-black text-[12px] uppercase tracking-wider text-slate-800">
                                    {dict.login.feature2Title}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    {dict.login.feature2Body}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Playful Form */}
            <div className="relative flex flex-col justify-center lg:items-center overflow-y-auto px-4 sm:px-8 py-12 lg:py-0 w-full">
                <div className="w-full max-w-[420px] space-y-8 relative">
                    
                    {/* Level Up Chip (Gamification touch) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden lg:flex absolute -top-12 -right-8 bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-100 items-center gap-3 z-20"
                    >
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xs">⭐</div>
                        <p className="text-[11px] font-bold text-slate-700">Level up your band score!</p>
                    </motion.div>

                    <Card className="border-none shadow-[0_30px_80px_rgba(0,0,0,0.05)] bg-white rounded-[3.5rem] relative overflow-hidden">
                        {/* Playful Top Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#26A69A]/5 to-transparent pointer-events-none" />
                        
                        <CardHeader className="space-y-3 pt-12 pb-6 px-10 text-center relative z-10">
                            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
                                {dict.login.hubHeader}
                            </CardTitle>
                            <CardDescription className="text-[13px] font-medium text-slate-500 max-w-[80%] mx-auto">
                                {dict.login.hubSubline}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-10 pb-12 space-y-6 relative z-10">
                            {/* Google OAuth */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-14 rounded-[32px] font-bold text-sm flex items-center justify-center gap-3 border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://cdn.simpleicons.org/google" alt="Google" className="w-5 h-5" />
                                {lang === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google'}
                            </Button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    {lang === 'vi' ? 'hoặc' : 'or'}
                                </span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            <form onSubmit={handleAuth} className="space-y-5">
                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1.5 overflow-hidden"
                                        >
                                            <Label className="ml-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                {lang === 'vi' ? 'Họ tên' : 'Full Name'}
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <Input
                                                    placeholder={lang === "vi" ? "Nhập họ tên của bạn" : "Enter your full name"}
                                                    className="rounded-[32px] h-14 pl-14 bg-slate-50 border-slate-200 focus-visible:ring-[#26A69A] focus-visible:ring-offset-0 text-base font-semibold"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1.5">
                                    <Label className="ml-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {dict.login.emailLabel}
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                        <Input
                                            type="email"
                                            placeholder={dict.login.emailPlaceholder || "email@example.com"}
                                            className="rounded-[32px] h-14 pl-14 bg-slate-50 border-slate-200 focus-visible:ring-[#26A69A] focus-visible:ring-offset-0 text-base font-semibold"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-5 -mt-1">{dict.login.emailHelper}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="ml-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {dict.login.passwordLabel}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="rounded-[32px] h-14 pl-14 bg-slate-50 border-slate-200 focus-visible:ring-[#26A69A] focus-visible:ring-offset-0 text-base font-semibold"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-5 -mt-1">{dict.login.passwordHelper}</p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-15 rounded-[32px] font-black text-sm uppercase tracking-wider transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-[#FF7043] to-[#FF8A65] shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 border-b-4 border-orange-700"
                                    disabled={loading}
                                >
                                    {loading ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...') : dict.login.loginBtn}
                                </Button>
                            </form>

                            <div className="text-center pt-4">
                                <p className="text-sm font-semibold text-slate-400">
                                    {mode === "login" ? dict.login.noAccount : (lang === 'vi' ? 'Đã có tài khoản?' : 'Already have an account?')}
                                    {" "}
                                    <button 
                                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                                        className="text-[#26A69A] font-black hover:underline underline-offset-4"
                                    >
                                        {mode === "login" ? dict.login.registerLink : dict.login.loginBtn}
                                    </button>
                                </p>
                                {mode === 'login' && (
                                    <p className="mt-2 text-[11px] font-bold text-slate-400/50 uppercase tracking-widest">
                                        {dict.login.noAccountSuffix}
                                    </p>
                                )}
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100 mt-4">
                                <div className="flex -space-x-2">
                                    {[1,2,3,4].map((i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF7043] to-[#E8A945] border-2 border-white" />
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {dict.login.socialProof}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Minimal Branding Footer */}
                    <div className="flex flex-col items-center gap-3 opacity-40">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jaxtina English Group</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
