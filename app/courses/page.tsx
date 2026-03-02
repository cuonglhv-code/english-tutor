import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "IELTS Courses | Jaxtina",
  description: "Explore Jaxtina IELTS preparation courses.",
};

export default function CoursesPage() {
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      <div className="border-b bg-card px-4 py-3 flex-shrink-0">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-jaxtina-red" />
            <div>
              <h1 className="font-bold text-base leading-none">Jaxtina IELTS Courses</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Official courses from jaxtina.com</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="https://jaxtina.com/khoa-luyen-thi-ielts/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open in new tab
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
