// app/quiz/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import QuizGameClient from "../tutor/QuizGameClient";

export default function QuizPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] py-16 px-6 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#26A69A]/5 blur-[100px] pointer-events-none transition-all duration-1000" />
      <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#FF7043]/5 blur-[120px] pointer-events-none transition-all duration-1000" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#26A69A 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
      />
      
      <div className="relative w-full max-w-3xl mx-auto z-10">
        <QuizGameClient />
      </div>
    </div>
  );
}
