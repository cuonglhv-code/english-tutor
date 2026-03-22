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
  const [nearestCenter, setNearestCenter] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect logged-out users to login
  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  // If profile is already complete, go straight to practice (Practice is usually /)
  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();
    supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.profile_completed === true) router.replace("/");
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
    if (!nearestCenter) {
      toast.error("Please select your nearest Jaxtina center.");
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
          full_name: (user!.user_metadata?.display_name as string) || (user!.email?.split("@")[0]),
          display_name: (user!.user_metadata?.display_name as string) || (user!.email?.split("@")[0]),
          age: ageNum,
          city: city.trim(),
          phone: phone.trim(),
          current_writing_band: currentBand === "not_tested" ? null : (currentBand || null),
          target_writing_band: targetBand || null,
          nearest_center: nearestCenter,
          profile_completed: true,
        }, { onConflict: "id" });

      if (profileErr) {
        console.error("Profile upsert error:", profileErr.message, profileErr.details);
        throw profileErr;
      }

      // Hard-navigate so the middleware re-reads profile_completed from DB (avoids cache race)
      window.location.href = "/dashboard";
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
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-600"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                  required
                >
                  <option value="" disabled>Select your city/province</option>
                  {[
                    "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
                  ].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
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

              {/* Nearest Center */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Nearest Center *
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-600"
                  value={nearestCenter}
                  onChange={(e) => setNearestCenter(e.target.value)}
                  disabled={saving}
                  required
                >
                  <option value="" disabled>Select your nearest center</option>
                  <option>Jaxtina Trần Quốc Hoàn, 239 Trần Quốc Hoàn, Cầu Giấy</option>
                  <option>Jaxtina Chiến Thắng, Số 112 Chiến Thắng, Hà Đông, Hà Nội</option>
                  <option>Jaxtina Minh Khai, Số 3 Phố Minh Khai, Hai Bà Trưng, Hà Nội</option>
                  <option>Jaxtina Thủ Đức, 25 Đường 1, Khu dân cư Areco, Linh Tây, Thủ Đức, TP.HCM</option>
                  <option>Jaxtina Quận 5, 3C Đ. Trần Phú, P4, Quận 5, TP.HCM</option>
                  <option>Jaxtina Gò Vấp, 12 Đường Số 12, Cityland Park Hills, P10, Quận Gò Vấp, TP.HCM</option>
                  <option>Jaxtina Nguyễn Văn Cừ, 60-62 Nguyễn Văn Cừ, Bồ Đề, Long Biên</option>
                </select>
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
