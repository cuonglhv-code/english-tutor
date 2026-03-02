"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function LoginPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(t("auth", "errorInvalid", lang));
        return;
      }
      router.push("/dashboard");
    } catch {
      toast.error(t("auth", "errorGeneric", lang));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const supabase = createBrowserClient();
      // IMPORTANT — Supabase dashboard steps required before Google login works:
      //   1. Authentication → Providers → Google → Enable → paste Client ID + Secret.
      //   2. In Google Cloud Console: add this as an Authorised Redirect URI:
      //      https://<your-project-ref>.supabase.co/auth/v1/callback
      // The redirectTo below routes back through our SSR callback to set session cookies.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        const isDisabled =
          error.message.toLowerCase().includes("provider is not enabled") ||
          error.message.toLowerCase().includes("unsupported provider") ||
          error.message.toLowerCase().includes("validation_failed");
        toast.error(
          isDisabled
            ? lang === "vi"
              ? "Đăng nhập bằng Google chưa được bật. Vui lòng dùng Email / Mật khẩu."
              : "Google login is not enabled yet. Please use Email / Password instead."
            : t("auth", "errorGeneric", lang)
        );
      }
    } catch {
      toast.error(t("auth", "errorGeneric", lang));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-jaxtina-red to-jaxtina-blue px-4 py-1.5 text-white text-sm font-medium mb-3">
            <GraduationCap className="h-4 w-4" />
            Jaxtina IELTS
          </div>
          <h1 className="text-2xl font-black">{t("auth", "loginTitle", lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("auth", "loginDesc", lang)}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("auth", "loginBtn", lang)}</CardTitle>
            <CardDescription>{t("auth", "loginDesc", lang)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {t("auth", "emailLabel", lang)}
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> {t("auth", "passwordLabel", lang)}
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t("auth", "loggingIn", lang) : t("auth", "loginBtn", lang)}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t("auth", "orContinueWith", lang)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("auth", "google", lang)}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("auth", "noAccount", lang)}{" "}
              <Link href="/register" className="text-jaxtina-blue font-medium hover:underline">
                {t("auth", "signupLink", lang)}
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground mt-2">
              <Link href="/" className="hover:underline">
                {t("auth", "skipLogin", lang)}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
