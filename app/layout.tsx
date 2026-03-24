import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "IELTS Writing Examiner | Jaxtina",
  description: "AI-powered IELTS Writing practice with instant band scores and personalised feedback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main className="px-0 sm:px-0 lg:px-0 overflow-x-hidden">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
