import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "IELTS Courses | Jaxtina",
  description: "Explore Jaxtina IELTS preparation courses.",
};

export default function CoursesPage() {
  return (
    <div className="flex flex-col bg-[#FAFAF8]" style={{ height: "calc(100vh - 64px)" }}>
      <div className="bg-white px-8 py-5 flex-shrink-0 border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF7043]/10 flex items-center justify-center text-[#FF7043]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-black text-xl leading-none text-slate-800 tracking-tight uppercase">IELTS Courses</h1>
              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">Official repository — jaxtina.com</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="rounded-full h-12 px-6 border-[#FF7043]/20 text-[#FF7043] font-black text-xs hover:bg-[#FF7043] hover:text-white transition-all shadow-sm" asChild>
            <a href="https://jaxtina.com/khoa-luyen-thi-ielts/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Open jaxtina.com
            </a>
          </Button>
        </div>
      </div>
      <iframe
        src="https://jaxtina.com/khoa-luyen-thi-ielts/"
        className="flex-1 w-full"
        style={{ border: "none" }}
        title="Jaxtina IELTS Courses"
        loading="lazy"
      />
    </div>
  );
}
