"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, User, MapPin, Phone, BarChart3, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { HALF_BANDS } from "@/lib/utils";

const WRITING_BANDS = ["not_tested", ...HALF_BANDS.filter((b) => b !== "0")];

export default function OnboardingPage() {
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();

  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [currentBand, setCurrentBand] = useState("");
  const [targetBand, setTargetBand] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect logged-out users to login
  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  // If profile is already complete, go straight to dashboard (check DB)
  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.profile_completed === true) router.replace("/dashboard");
      });
  }, [user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 70) {
      toast.error(t("onboarding", "errorAge", lang));
      return;
    }
    if (!city.trim()) {
      toast.error(t("onboarding", "errorCity", lang));
      return;
    }
    if (!phone.trim()) {
      toast.error(t("onboarding", "errorPhone", lang));
      return;
    }

    setSaving(true);
    try {
      const supabase = createBrowserClient();

      // 1. Save profile fields — upsert handles both missing and existing rows
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({
          id: user!.id,
          email: user!.email ?? "",
          age: ageNum,
          city: city.trim(),
          phone: phone.trim(),
          current_writing_band: currentBand === "not_tested" ? null : (currentBand || null),
          target_writing_band: targetBand || null,
          profile_completed: true,
        }, { onConflict: "id" });

      if (profileErr) {
        console.error("Profile upsert error:", profileErr.message, profileErr.details);
        throw profileErr;
      }

      // Middleware now checks profiles.profile_completed directly — no need
      // to wait for auth.updateUser (which can hang before the token refresh).
      router.push("/dashboard");
    } catch (err) {
      const msg = (err as { message?: string })?.message || t("common", "error", lang);
      console.error("Onboarding save error:", msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-jaxtina-red to-jaxtina-blue px-4 py-1.5 text-white text-sm font-medium mb-3">
            <GraduationCap className="h-4 w-4" />
            Jaxtina IELTS
          </div>
          <h1 className="text-2xl font-black">{t("onboarding", "title", lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("onboarding", "desc", lang)}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4 text-jaxtina-red" />
              {t("onboarding", "step", lang)}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Age */}
              <div className="space-y-1">
                <Label htmlFor="age">{t("onboarding", "age", lang)} *</Label>
                <Input
                  id="age"
                  type="number"
                  min={16}
                  max={70}
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {t("onboarding", "city", lang)} *
                </Label>
                <Input
                  placeholder={t("onboarding", "cityPlaceholder", lang)}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {t("onboarding", "phone", lang)} *
                </Label>
                <Input
                  placeholder={t("onboarding", "phonePlaceholder", lang)}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Current Writing Band */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> {t("onboarding", "currentBand", lang)}
                </Label>
                <Select onValueChange={setCurrentBand} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("onboarding", "notTested", lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_tested">{t("onboarding", "notTested", lang)}</SelectItem>
                    {WRITING_BANDS.filter((b) => b !== "not_tested").map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Writing Band */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> {t("onboarding", "targetBand", lang)}
                </Label>
                <Select onValueChange={setTargetBand} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {WRITING_BANDS.filter((b) => b !== "not_tested").map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("onboarding", "saving", lang)}</>
                ) : (
                  t("onboarding", "saveBtn", lang)
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
