// app/tutor/trivia/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import TriviaGameClient from "../TriviaGameClient";

export default function TriviaPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/tutor/trivia");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jaxtina-red" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-3xl">
        <TriviaGameClient />
      </div>
    </div>
  );
}
