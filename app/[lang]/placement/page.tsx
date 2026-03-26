import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Headphones, PenLine, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PlacementIntroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-32">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block gradient-secondary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            Free Assessment
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-on-surface mb-6 tracking-tight font-display">
            IELTS Placement Test
            <br />
            <span className="text-primary italic">Bài kiểm tra xếp lớp</span>
          </h1>
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-on-surface-variant text-xl font-medium leading-relaxed">
              This test assesses your current level in Reading, Listening, and
              Writing to suggest the most suitable study plan.
            </p>
            <p className="text-on-surface-variant/60 text-base italic">
              Bài kiểm tra đánh giá trình độ hiện tại về Reading, Listening và
              Writing để gợi ý lộ trình học phù hợp.
            </p>
          </div>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <SectionCard
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            title="Reading"
            subtitle="Reading"
            duration="60 min"
            description="Passage with True/False/NG and multiple choice questions."
            descriptionVi="Bài đọc với câu hỏi True/False/NG và trắc nghiệm."
            color="blue"
          />
          <SectionCard
            icon={<Headphones className="h-6 w-6 text-teal-600" />}
            title="Listening"
            subtitle="Listening"
            duration="35 min"
            description="Audio recording with note-taking and fill-in-the-blank questions."
            descriptionVi="Nghe băng và điền vào chỗ trống."
            color="teal"
          />
          <SectionCard
            icon={<PenLine className="h-6 w-6 text-secondary" />}
            title="Writing"
            subtitle="Writing"
            duration="60 min"
            description="Write a short response to a visual prompt (≥ 150 words)."
            descriptionVi="Viết bài phản hồi cho một đề bài trực quan (≥ 150 từ)."
            color="amber"
          />
        </div>

        {/* Time notice */}
        <div className="flex items-start gap-4 bg-white/50 backdrop-blur-md rounded-3xl p-6 mb-12 text-sm text-on-surface-variant shadow-stitched border-none">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <strong className="text-on-surface font-black uppercase tracking-wider text-xs">Total time: ~2.5 hours</strong>
               <span className="text-primary/20">•</span>
               <span className="text-on-surface-variant/70 italic font-medium">Tổng thời gian: khoảng 2.5 giờ</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Each section has a countdown timer. Your progress is saved, so you
              can resume if you reload. / Mỗi phần có đồng hồ đếm ngược. Tiến
              trình được lưu khi tải lại trang.
            </p>
          </div>
        </div>

        {/* Auth gate / CTA */}
        {user ? (
          <div className="text-center">
            <Button asChild size="lg" className="rounded-2xl px-12 text-lg h-14 gradient-secondary border-none shadow-lg hover:scale-105 transition-transform">
              <Link href="/placement/test">
                Start Placement Test · Bắt đầu
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <p className="text-[10px] font-bold text-on-surface-variant/40 mt-4 uppercase tracking-widest">
              Signed in as {user.email} · Results will be saved
            </p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex items-center gap-3 justify-center text-sm text-secondary bg-secondary/5 border-none rounded-2xl p-4 mb-4 max-w-lg mx-auto">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-bold">
                Please log in to take the test and save your results. ·
                Đăng nhập để làm bài và lưu kết quả.
              </span>
            </div>
            <Button asChild size="lg" className="rounded-2xl px-12 text-lg h-14 gradient-secondary border-none shadow-lg hover:scale-105 transition-transform">
              <Link href="/login?next=/placement/test">
                Log in to Start · Đăng nhập
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Local sub-component ──────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  descriptionVi: string;
  color: "blue" | "teal" | "amber";
}

const colorMap = {
  blue:  { bg: "bg-primary/5",    badge: "bg-primary text-white" },
  teal:  { bg: "bg-teal-500/5",   badge: "bg-teal-600 text-white" },
  amber: { bg: "bg-secondary/5", badge: "bg-secondary text-white" },
};

function SectionCard({ icon, title, subtitle, duration, description, descriptionVi, color }: SectionCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-3xl border-none ${c.bg} p-6 flex flex-col gap-4 shadow-sm hover:shadow-stitched transition-all hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-white rounded-2xl shadow-sm">
           {icon}
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${c.badge}`}>
          {duration}
        </span>
      </div>
      <div>
        <p className="font-black text-on-surface text-lg font-display tracking-tight">{title}</p>
        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">{subtitle}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{description}</p>
        <p className="text-xs text-on-surface-variant/50 italic">{descriptionVi}</p>
      </div>
    </div>
  );
}
