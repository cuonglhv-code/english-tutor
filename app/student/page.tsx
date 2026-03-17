"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin,
  Target,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserExamDate, UserGoals } from "@/types/lms";
import { HALF_BANDS } from "@/lib/utils";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  age: number | null;
  date_of_birth: string | null;
  nearest_center: string | null;
  role: string | null;
  profile_completed: boolean | null;
  current_writing_band: string | null;
  target_writing_band: string | null;
  current_band: number | null;
  target_band: number | null;
  notes: string | null;
};

const CENTERS = [
  "Jaxtina Trần Quốc Hoàn, 239 Trần Quốc Hoàn, Cầu Giấy",
  "Jaxtina Chiến Thắng, Số 112 Chiến Thắng, Hà Đông, Hà Nội",
  "Jaxtina Minh Khai, Số 3 Phố Minh Khai, Hai Bà Trưng, Hà Nội",
  "Jaxtina Thủ Đức, 25 Đường 1, Khu dân cư Areco, Linh Tây, Thủ Đức, TP.HCM",
  "Jaxtina Quận 5, 3C Đ. Trần Phú, P4, Quận 5, TP.HCM",
  "Jaxtina Gò Vấp, 12 Đường Số 12, Cityland Park Hills, P10, Quận Gò Vấp, TP.HCM",
  "Jaxtina Nguyễn Văn Cừ, 60-62 Nguyễn Văn Cừ, Bồ Đề, Long Biên",
];

const BAND_ITEMS = HALF_BANDS.filter((b) => b !== "0");

export default function StudentDetailsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();

  const supabase = useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [examDate, setExamDate] = useState<UserExamDate | null>(null);

  // form state (profile)
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [nearestCenter, setNearestCenter] = useState("");
  const [currentWritingBand, setCurrentWritingBand] = useState<string>("not_tested");
  const [targetWritingBand, setTargetWritingBand] = useState<string>("");
  const [currentBand, setCurrentBand] = useState<string>("");
  const [targetBand, setTargetBand] = useState<string>("");

  // form state (LMS)
  const [examDateValue, setExamDateValue] = useState<string>("");
  const [goalCurrentOverall, setGoalCurrentOverall] = useState<string>("");
  const [goalTargetOverall, setGoalTargetOverall] = useState<string>("");
  const [goalCurrentReading, setGoalCurrentReading] = useState<string>("");
  const [goalTargetReading, setGoalTargetReading] = useState<string>("");
  const [goalCurrentListening, setGoalCurrentListening] = useState<string>("");
  const [goalTargetListening, setGoalTargetListening] = useState<string>("");
  const [goalCurrentWriting, setGoalCurrentWriting] = useState<string>("");
  const [goalTargetWriting, setGoalTargetWriting] = useState<string>("");
  const [goalCurrentSpeaking, setGoalCurrentSpeaking] = useState<string>("");
  const [goalTargetSpeaking, setGoalTargetSpeaking] = useState<string>("");

  // auth guard
  useEffect(() => {
    if (!userLoading && !user) router.replace("/login?next=/student");
  }, [user, userLoading, router]);

  // load
  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      try {
        const [pRes, gRes, eRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).single(),
          supabase.from("user_goals").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("user_exam_dates").select("*").eq("user_id", uid).maybeSingle(),
        ]);

        if (cancelled) return;

        if (pRes.error) throw pRes.error;
        const p = pRes.data as ProfileRow;
        setProfile(p);

        const g = (gRes.data as UserGoals | null) ?? null;
        const e = (eRes.data as UserExamDate | null) ?? null;
        setGoals(g);
        setExamDate(e);

        // hydrate profile form
        setDisplayName(p.display_name ?? "");
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setCity(p.city ?? "");
        setAge(p.age != null ? String(p.age) : "");
        setDob(p.date_of_birth ?? "");
        setNearestCenter(p.nearest_center ?? "");
        setCurrentWritingBand(p.current_writing_band ?? "not_tested");
        setTargetWritingBand(p.target_writing_band ?? "");
        setCurrentBand(p.current_band != null ? String(p.current_band) : "");
        setTargetBand(p.target_band != null ? String(p.target_band) : "");

        // hydrate LMS form
        setExamDateValue(e?.exam_date ?? "");

        setGoalCurrentOverall(g?.current_overall != null ? String(g.current_overall) : "");
        setGoalTargetOverall(g?.target_overall != null ? String(g.target_overall) : "");
        setGoalCurrentReading(g?.current_reading != null ? String(g.current_reading) : "");
        setGoalTargetReading(g?.target_reading != null ? String(g.target_reading) : "");
        setGoalCurrentListening(g?.current_listening != null ? String(g.current_listening) : "");
        setGoalTargetListening(g?.target_listening != null ? String(g.target_listening) : "");
        setGoalCurrentWriting(g?.current_writing != null ? String(g.current_writing) : "");
        setGoalTargetWriting(g?.target_writing != null ? String(g.target_writing) : "");
        setGoalCurrentSpeaking(g?.current_speaking != null ? String(g.current_speaking) : "");
        setGoalTargetSpeaking(g?.target_speaking != null ? String(g.target_speaking) : "");
      } catch (err: any) {
        console.error("[student] load error:", err?.message);
        toast.error(err?.message || (lang === "vi" ? "Không tải được hồ sơ." : "Failed to load profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [user, supabase, lang]);

  const save = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const ageNum = age.trim() ? Number(age) : null;
      if (ageNum != null && (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 120)) {
        toast.error(lang === "vi" ? "Tuổi không hợp lệ." : "Invalid age.");
        return;
      }

      const toNum = (v: string) => (v.trim() ? Number(v) : null);
      const toBandNum = (v: string) => {
        if (!v.trim()) return null;
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        return n;
      };

      const profilePatch: Partial<ProfileRow> = {
        display_name: displayName.trim() || null,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        age: ageNum,
        date_of_birth: dob || null,
        nearest_center: nearestCenter || null,
        current_writing_band: currentWritingBand === "not_tested" ? null : currentWritingBand || null,
        target_writing_band: targetWritingBand || null,
        current_band: toBandNum(currentBand),
        target_band: toBandNum(targetBand),
        profile_completed: true,
      };

      const goalsPatch: Partial<UserGoals> = {
        current_overall: toNum(goalCurrentOverall),
        target_overall: toNum(goalTargetOverall),
        current_reading: toNum(goalCurrentReading),
        target_reading: toNum(goalTargetReading),
        current_listening: toNum(goalCurrentListening),
        target_listening: toNum(goalTargetListening),
        current_writing: toNum(goalCurrentWriting),
        target_writing: toNum(goalTargetWriting),
        current_speaking: toNum(goalCurrentSpeaking),
        target_speaking: toNum(goalTargetSpeaking),
      };

      const [pUp, gUp, eUp] = await Promise.all([
        supabase.from("profiles").update(profilePatch).eq("id", user.id),
        supabase
          .from("user_goals")
          .upsert(
            {
              user_id: user.id,
              ...goalsPatch,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: "user_id" }
          ),
        supabase
          .from("user_exam_dates")
          .upsert(
            {
              user_id: user.id,
              exam_date: examDateValue || null,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: "user_id" }
          ),
      ]);

      if (pUp.error) throw pUp.error;
      if (gUp.error) throw gUp.error;
      if (eUp.error) throw eUp.error;

      toast.success(lang === "vi" ? "Đã lưu hồ sơ." : "Profile saved.");
    } catch (err: any) {
      console.error("[student] save error:", err?.message);
      toast.error(err?.message || (lang === "vi" ? "Lưu thất bại." : "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {lang === "vi" ? "Hồ sơ học viên" : "Student profile"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "vi"
                ? "Cập nhật thông tin, mục tiêu và ngày thi của bạn."
                : "Update your details, goals, and exam date."}
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {lang === "vi" ? "Lưu" : "Save"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-jaxtina-red" />
              {lang === "vi" ? "Tài khoản" : "Account"}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" /> {profile.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Tên hiển thị" : "Display name"}</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Họ và tên" : "Full name"}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <PhoneIcon className="h-3.5 w-3.5" /> {lang === "vi" ? "Số điện thoại" : "Phone"}
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {lang === "vi" ? "Thành phố/Tỉnh" : "City"}
              </Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Tuổi" : "Age"}</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Ngày sinh" : "Date of birth"}</Label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>{lang === "vi" ? "Cơ sở gần nhất" : "Nearest center"}</Label>
              <Select value={nearestCenter} onValueChange={setNearestCenter}>
                <SelectTrigger>
                  <SelectValue placeholder={lang === "vi" ? "Chọn cơ sở" : "Choose a center"} />
                </SelectTrigger>
                <SelectContent>
                  {CENTERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5" /> {lang === "vi" ? "Hoàn tất hồ sơ" : "Profile completed"}
              </Label>
              <Input value={profile.profile_completed ? "Yes" : "No"} readOnly />
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Vai trò" : "Role"}</Label>
              <Input value={profile.role ?? "user"} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-jaxtina-blue" />
              {lang === "vi" ? "Band mục tiêu" : "Band targets"}
            </CardTitle>
            <CardDescription>
              {lang === "vi"
                ? "Band viết (onboarding) và band tổng (cho admin/overview)."
                : "Writing bands (onboarding) and overall bands (admin/overview)."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Band viết hiện tại" : "Current writing band"}</Label>
              <Select value={currentWritingBand} onValueChange={setCurrentWritingBand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_tested">{lang === "vi" ? "Chưa test" : "Not tested"}</SelectItem>
                  {BAND_ITEMS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Band viết mục tiêu" : "Target writing band"}</Label>
              <Select value={targetWritingBand} onValueChange={setTargetWritingBand}>
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {BAND_ITEMS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{lang === "vi" ? "Band tổng hiện tại" : "Current overall band"}</Label>
              <Input
                inputMode="decimal"
                placeholder="6.5"
                value={currentBand}
                onChange={(e) => setCurrentBand(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Band tổng mục tiêu" : "Target overall band"}</Label>
              <Input
                inputMode="decimal"
                placeholder="7.0"
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-600" />
              {lang === "vi" ? "Ngày thi" : "Exam date"}
            </CardTitle>
            <CardDescription>
              {lang === "vi"
                ? "Dùng để tính ngày đếm ngược trên Dashboard."
                : "Used for the countdown on your dashboard."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Ngày thi" : "Exam date"}</Label>
              <Input type="date" value={examDateValue} onChange={(e) => setExamDateValue(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-jaxtina-red" />
              {lang === "vi" ? "Mục tiêu theo kỹ năng" : "Goals by skill"}
            </CardTitle>
            <CardDescription>
              {lang === "vi"
                ? "Bạn có thể cập nhật band hiện tại/mục tiêu cho từng kỹ năng."
                : "Update current/target bands for each skill."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground">
              <div>{lang === "vi" ? "Kỹ năng" : "Skill"}</div>
              <div>{lang === "vi" ? "Hiện tại" : "Current"}</div>
              <div>{lang === "vi" ? "Mục tiêu" : "Target"}</div>
            </div>

            {([
              ["Overall", goalCurrentOverall, setGoalCurrentOverall, goalTargetOverall, setGoalTargetOverall],
              ["Reading", goalCurrentReading, setGoalCurrentReading, goalTargetReading, setGoalTargetReading],
              ["Listening", goalCurrentListening, setGoalCurrentListening, goalTargetListening, setGoalTargetListening],
              ["Writing", goalCurrentWriting, setGoalCurrentWriting, goalTargetWriting, setGoalTargetWriting],
              ["Speaking", goalCurrentSpeaking, setGoalCurrentSpeaking, goalTargetSpeaking, setGoalTargetSpeaking],
            ] as const).map(([label, cur, setCur, tar, setTar]) => (
              <div key={label} className="grid grid-cols-3 gap-3 items-center">
                <div className="text-sm font-semibold">{label}</div>
                <Input inputMode="decimal" placeholder="6.5" value={cur} onChange={(e) => setCur(e.target.value)} />
                <Input inputMode="decimal" placeholder="7.0" value={tar} onChange={(e) => setTar(e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

