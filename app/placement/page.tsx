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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
            Free Assessment
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            IELTS Placement Test
            <br />
            <span className="text-blue-600">Bài kiểm tra xếp lớp IELTS</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            This test assesses your current level in Reading, Listening, and
            Writing to suggest the most suitable study plan.
          </p>
          <p className="text-slate-500 text-base max-w-xl mx-auto mt-1">
            Bài kiểm tra đánh giá trình độ hiện tại về Reading, Listening và
            Writing để gợi ý lộ trình học phù hợp.
          </p>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <SectionCard
            icon={<BookOpen className="h-6 w-6 text-blue-600" />}
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
            icon={<PenLine className="h-6 w-6 text-amber-600" />}
            title="Writing"
            subtitle="Writing"
            duration="60 min"
            description="Write a short response to a visual prompt (≥ 150 words)."
            descriptionVi="Viết bài phản hồi cho một đề bài trực quan (≥ 150 từ)."
            color="amber"
          />
        </div>

        {/* Time notice */}
        <div className="flex items-start gap-3 bg-slate-100 rounded-xl p-4 mb-8 text-sm text-slate-600">
          <Clock className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <strong className="text-slate-700">Total time: ~2.5 hours</strong>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-slate-500">Tổng thời gian: khoảng 2.5 giờ</span>
            <p className="text-slate-500 mt-1">
              Each section has a countdown timer. Your progress is saved, so you
              can resume if you reload. / Mỗi phần có đồng hồ đếm ngược. Tiến
              trình được lưu khi tải lại trang.
            </p>
          </div>
        </div>

        {/* Auth gate / CTA */}
        {user ? (
          <div className="text-center">
            <Button asChild size="lg" className="rounded-full px-10 text-base h-12">
              <Link href="/placement/test">
                Start Placement Test · Bắt đầu kiểm tra
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-slate-400 mt-3">
              Signed in as {user.email} · Results will be saved to your profile.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="flex items-center gap-2 justify-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Please log in to take the test and save your results. ·
                Đăng nhập để làm bài và lưu kết quả.
              </span>
            </div>
            <Button asChild size="lg" className="rounded-full px-10 text-base h-12">
              <Link href="/login?next=/placement/test">
                Log in to Start · Đăng nhập để bắt đầu
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
  blue:  { bg: "bg-blue-50",  border: "border-blue-100",  badge: "bg-blue-100 text-blue-700" },
  teal:  { bg: "bg-teal-50",  border: "border-teal-100",  badge: "bg-teal-100 text-teal-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
};

function SectionCard({ icon, title, subtitle, duration, description, descriptionVi, color }: SectionCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
          {duration}
        </span>
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <p className="text-xs text-slate-600">{description}</p>
      <p className="text-xs text-slate-500 italic">{descriptionVi}</p>
    </div>
  );
}
