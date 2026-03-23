// app/quiz/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import QuizGameClient from "../tutor/QuizGameClient";

export default function QuizPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start py-10 px-4">
      {/* Navigation Header */}
      <div className="w-full max-w-3xl mb-6">
        <Link
          href="/experience"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-sm backdrop-blur-sm transition-all text-sm font-medium border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Experience
        </Link>
      </div>

      <div className="w-full max-w-3xl">
        <QuizGameClient />
      </div>
    </div>
  );
}
