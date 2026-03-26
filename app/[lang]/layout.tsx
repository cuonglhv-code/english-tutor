import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "../globals.css";
import { Toaster } from "sonner";
import { i18n, type Locale } from "@/lib/i18n/i18n-config";

export const metadata: Metadata = {
  title: "IELTS Scholar | The Digital Mentor",
  description: "AI-powered academic excellence for IELTS candidates worldwide.",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className="antialiased bg-surface text-on-surface">
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
