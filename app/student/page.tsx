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
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { createBrowserClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định",
  "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai",
  "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
  "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
  "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];

const CENTERS = [
  "Jaxtina Trần Quốc Hoàn, 239 Trần Quốc Hoàn, Cầu Giấy",
  "Jaxtina Chiến Thắng, Số 112 Chiến Thắng, Hà Đông, Hà Nội",
  "Jaxtina Minh Khai, Số 3 Phố Minh Khai, Hai Bà Trưng, Hà Nội",
  "Jaxtina Thủ Đức, 25 Đường 1, Khu dân cư Areco, Linh Tây, Thủ Đức, TP.HCM",
  "Jaxtina Quận 5, 3C Đ. Trần Phú, P4, Quận 5, TP.HCM",
  "Jaxtina Gò Vấp, 12 Đường Số 12, Cityland Park Hills, P10, Quận Gò Vấp, TP.HCM",
  "Jaxtina Nguyễn Văn Cừ, 60-62 Nguyễn Văn Cừ, Bồ Đề, Long Biên",
];

export default function StudentDetailsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { lang } = useLanguage();

  const supabase = useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileRow | null>(null);

  // form state (profile)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [nearestCenter, setNearestCenter] = useState("");

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
        const pRes = await supabase.from("profiles").select("*").eq("id", uid).single();

        if (cancelled) return;

        if (pRes.error) throw pRes.error;
        const p = pRes.data as ProfileRow;
        setProfile(p);

        // hydrate profile form
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setCity(p.city ?? "");
        setAge(p.age != null ? String(p.age) : "");
        setNearestCenter(p.nearest_center ?? "");
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

      const profilePatch: Partial<ProfileRow> = {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        age: ageNum,
        nearest_center: nearestCenter || null,
        profile_completed: true,
      };
      const pUp = await supabase.from("profiles").update(profilePatch).eq("id", user.id);
      if (pUp.error) throw pUp.error;

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
                ? "Cập nhật thông tin cá nhân của bạn."
                : "Update your personal details."}
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
              {profile.profile_completed && (
                <Badge className="ml-2 bg-green-600 hover:bg-green-600 text-white gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {lang === "vi" ? "Đã hoàn tất" : "Completed"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" /> {profile.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
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
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder={lang === "vi" ? "Chọn tỉnh/thành" : "Select province/city"} />
                </SelectTrigger>
                <SelectContent>
                  {VIETNAM_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{lang === "vi" ? "Tuổi" : "Age"}</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
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
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

