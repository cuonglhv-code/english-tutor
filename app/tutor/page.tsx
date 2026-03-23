// app/tutor/page.tsx
"use client";

import { Loader2 } from "lucide-react";
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

  return <HomeScreenClient userId={user?.id || ""} />;
}
