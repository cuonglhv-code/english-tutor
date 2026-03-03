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
