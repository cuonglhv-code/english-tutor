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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-3xl">
        <QuizGameClient />
      </div>
    </div>
  );
}
