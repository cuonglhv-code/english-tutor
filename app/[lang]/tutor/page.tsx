// app/tutor/page.tsx
"use client";

import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import HomeScreenClient from "./HomeScreenClient";

export default function TutorHomePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Floating Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <a
          href="https://jaxtina-ielts-examiner.vercel.app/experience"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-sm transition-all text-sm font-medium border border-slate-200 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Experience
        </a>
      </div>

      <HomeScreenClient userId={user?.id || ""} />
    </div>
  );
}
