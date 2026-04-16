import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "../globals.css";
import { Toaster } from "sonner";
import { i18n, type Locale } from "@/lib/i18n/i18n-config";

export const metadata: Metadata = {
  title: "Jaxtina Tutor | Powered by Claude AI",
  description: "AI-powered academic excellence for IELTS candidates worldwide.",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased bg-background text-textPrimary">
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
