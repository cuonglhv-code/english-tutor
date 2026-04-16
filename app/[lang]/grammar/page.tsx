"use client";
import { Suspense, useState, useEffect } from "react";
import { GrammarApp } from "@/components/grammar/GrammarApp";
import { Loader2 } from "lucide-react";

export default function GrammarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="h-10 w-10 animate-spin text-[#D97757] opacity-20" />
      </div>
    }>
      <GrammarApp />
    </Suspense>
  );
}